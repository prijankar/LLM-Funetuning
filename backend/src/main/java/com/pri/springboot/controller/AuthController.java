package com.pri.springboot.controller;

import com.pri.springboot.dto.LoginRequest;
import com.pri.springboot.dto.RegisterRequest;
import com.pri.springboot.dto.UserDto;
import com.pri.springboot.security.JwtTokenProvider;
import com.pri.springboot.security.UserPrincipal;
import com.pri.springboot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
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
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get the fully loaded user with roles
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        UserDto userDto = userService.getCurrentUser(userPrincipal.getUsername());
        
        // Generate token after we have the user with roles
        String jwt = tokenProvider.generateToken(authentication);
        
        // Log the roles for debugging
        System.out.println("User " + userPrincipal.getUsername() + " logged in with roles: " + 
            userPrincipal.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(Map.of(
            "accessToken", jwt,
            "tokenType", "Bearer",
            "user", userDto
        ));
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
            
        UserDto userDto = userService.getCurrentUser(userPrincipal.getUsername());
        return ResponseEntity.ok(userDto);
    }
}