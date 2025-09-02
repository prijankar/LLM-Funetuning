package com.pri.springboot.config;

import com.pri.springboot.entity.ERole;
import com.pri.springboot.entity.Role;
import com.pri.springboot.entity.User;
import com.pri.springboot.repository.RoleRepository;
import com.pri.springboot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, 
                         RoleRepository roleRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Create roles if they don't exist
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
            .orElseGet(() -> {
                Role role = new Role(ERole.ROLE_ADMIN);
                return roleRepository.save(role);
            });
            
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
            .orElseGet(() -> {
                Role role = new Role(ERole.ROLE_USER);
                return roleRepository.save(role);
            });

        // Create admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            roles.add(userRole);
            
            admin.setRoles(roles);
            userRepository.save(admin);
        }
    }
}