package com.pri.springboot.controller;

import com.pri.springboot.dto.LoginRequest;
import com.pri.springboot.dto.RegisterRequest;
import com.pri.springboot.dto.UserDto;
import com.pri.springboot.security.JwtTokenProvider;
import com.pri.springboot.security.UserPrincipal;
import com.pri.springboot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired 
    private AuthenticationManager authenticationManager;
    
    @Autowired 
    private UserService userService;
    
    @Autowired 
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userService.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Username is already taken!"));
        }
        
        if (userService.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is already in use!"));
        }
        
        // Create new user's account
        userService.createUser(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword())
        );
        
        return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Get the login identifier (email or username)
            String loginIdentifier = loginRequest.getLoginIdentifier();
            
            if (loginIdentifier == null || loginIdentifier.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email or username is required"));
            }

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginIdentifier,
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get the fully loaded user with roles
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            UserDto userDto = userService.getCurrentUser(userPrincipal.getUsername());
            
            // Generate token after we have the user with roles
            String jwt = tokenProvider.generateToken(authentication);
            
            return ResponseEntity.ok(Map.of(
                "accessToken", jwt,
                "tokenType", "Bearer",
                "user", userDto
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("error", "Invalid email/username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", "An error occurred during authentication"));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
            
        UserDto userDto = userService.getCurrentUser(userPrincipal.getUsername());
        return ResponseEntity.ok(userDto);
    }
}