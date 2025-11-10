# Spring Boot OAuth Integration Guide

This guide explains how to integrate the Next.js frontend with your Spring Boot backend OAuth system.

## Architecture Overview

You have two OAuth flows to choose from:

### Option 1: Frontend-Managed OAuth (Current Implementation)
- NextAuth.js handles OAuth flow in the frontend
- Frontend receives OAuth tokens from Google
- Frontend sends OAuth user data to Spring Boot backend
- Backend creates/updates user and returns JWT token

### Option 2: Backend-Managed OAuth (Spring Boot Security)
- Spring Boot handles the entire OAuth flow
- Frontend redirects to Spring Boot OAuth endpoints
- Backend handles Google OAuth and returns JWT token
- Frontend receives token via redirect

## Option 1: Frontend-Managed OAuth (Recommended for SPA)

This is already implemented. Here's how it works:

### Flow:
1. User clicks "Continue with Google" in frontend
2. NextAuth.js redirects to Google OAuth
3. Google redirects back to Next.js with auth code
4. NextAuth.js exchanges code for tokens
5. Next.js sends user data to Spring Boot: `POST /auth/oauth/google`
6. Spring Boot creates/finds user and returns JWT
7. Frontend stores JWT and uses it for API calls

### Spring Boot Endpoint Needed:

```java
@RestController
@RequestMapping("/api/auth/oauth")
public class OAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogleUser(@RequestBody OAuthUserRequest request) {
        // Find or create user from Google OAuth data
        User user = userService.findOrCreateOAuthUser(
            request.getEmail(),
            request.getName(),
            request.getAvatar(),
            request.getGoogleId(),
            "GOOGLE"
        );

        // Generate JWT token
        String token = tokenProvider.generateToken(user);

        // Return response in expected format
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("name", user.getName());
        userData.put("avatar", user.getAvatar());

        data.put("user", userData);
        response.put("data", data);

        return ResponseEntity.ok(response);
    }
}

// Request DTO
@Data
public class OAuthUserRequest {
    private String email;
    private String name;
    private String avatar;
    private String googleId;
    private String provider;
}
```

## Option 2: Backend-Managed OAuth (Spring Boot Security)

If you prefer to let Spring Boot handle everything:

### Update Frontend to Use Spring Boot OAuth:

1. **Modify [src/lib/auth-spring.ts](src/lib/auth-spring.ts)** (new file):

```typescript
// Use this alternative auth configuration
export const loginWithGoogleSpringBoot = () => {
  // Redirect to Spring Boot OAuth endpoint
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '');
  window.location.href = `${backendUrl}/oauth2/authorize/google?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
};
```

2. **Create callback page [src/app/auth/callback/page.tsx](src/app/auth/callback/page.tsx)**:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      router.push('/auth?error=oauth_failed');
      return;
    }

    if (token) {
      // Store token and fetch user data
      localStorage.setItem('authToken', token);

      // Fetch user data from backend
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('userData', JSON.stringify(data.data));
            router.push('/dashboard');
          }
        })
        .catch(err => {
          console.error('Failed to fetch user data:', err);
          router.push('/auth?error=fetch_failed');
        });
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-white">Completing sign in...</p>
      </div>
    </div>
  );
}
```

### Spring Boot Configuration:

Your current Spring Boot config looks good! Just add the success handler:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler())
                .failureHandler(oAuth2AuthenticationFailureHandler())
            );

        return http.build();
    }

    @Bean
    public OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return new OAuth2AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(
                HttpServletRequest request,
                HttpServletResponse response,
                Authentication authentication
            ) throws IOException {
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

                // Create or find user
                User user = userService.findOrCreateOAuthUser(oAuth2User);

                // Generate JWT
                String token = jwtTokenProvider.generateToken(user);

                // Redirect to frontend with token
                String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
                response.sendRedirect(redirectUrl);
            }
        };
    }
}
```

## Current Implementation (Option 1)

Your frontend is currently configured for **Option 1** (Frontend-Managed OAuth). To make it work:

### 1. Update Spring Boot Endpoint

Add the endpoint shown above to handle: `POST /api/auth/oauth/google`

### 2. Configure Google Cloud Console

Make sure you have these redirect URIs in Google Cloud Console:
- Frontend OAuth: `http://localhost:3000/api/auth/callback/google`
- Backend OAuth (optional): `http://localhost:8080/oauth2/callback/google`

### 3. Environment Variables

**Frontend (.env.local):**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Backend (application.yml):**
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: profile,email
            redirect-uri: "{baseUrl}/oauth2/callback/{registrationId}"
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://www.googleapis.com/oauth2/v4/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub

app:
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
  jwt:
    secret: ${JWT_SECRET}
    expiration: 604800000 # 7 days
```

## Testing

### Test Frontend OAuth:
1. Start Spring Boot: `./mvnw spring-boot:run`
2. Start Next.js: `npm run dev`
3. Navigate to http://localhost:3000
4. Click "Continue with Google"
5. Complete Google sign-in
6. Check browser console and network tab
7. Verify token is received and stored

### Debug Checklist:
- [ ] Google OAuth credentials are correct
- [ ] Redirect URIs match in Google Console
- [ ] Spring Boot endpoint `/api/auth/oauth/google` exists
- [ ] CORS is enabled on Spring Boot for `http://localhost:3000`
- [ ] JWT token generation works
- [ ] Frontend receives and stores token

## CORS Configuration (Important!)

Make sure your Spring Boot has CORS enabled:

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## API Communication After OAuth

Once the user is authenticated, all API calls should include the JWT token:

```typescript
// In frontend
const token = localStorage.getItem('authToken');

fetch(`${API_BASE_URL}/stocks/watchlist`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

Spring Boot should validate this token:

```java
@Configuration
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String token = extractToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserIdFromToken(token);
            // Set authentication in security context
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
```

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Complete OAuth consent screen in Google Cloud Console
- Add your email as a test user

### OAuth succeeds but backend call fails
- Check CORS configuration
- Verify backend endpoint exists
- Check backend logs for errors
- Verify request/response format matches

### Token not being stored
- Check browser console for errors
- Verify NextAuth callback is working
- Check network tab for failed requests

## Security Best Practices

1. **Use HTTPS in production**
2. **Validate tokens on every request**
3. **Implement token refresh mechanism**
4. **Set appropriate token expiration**
5. **Never expose client secrets in frontend**
6. **Use httpOnly cookies for token storage (production)**
7. **Implement rate limiting on auth endpoints**
8. **Add CSRF protection**
9. **Log auth failures for monitoring**
10. **Use environment-specific OAuth credentials**
