package com.pri.springboot.service;

import com.pri.springboot.dto.UpdateUserRoleRequest;
import com.pri.springboot.dto.UserDto;
import com.pri.springboot.entity.ERole;
import com.pri.springboot.entity.Role;
import com.pri.springboot.entity.User;
import com.pri.springboot.exception.ResourceNotFoundException;
import com.pri.springboot.repository.RoleRepository;
import com.pri.springboot.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, 
                         RoleRepository roleRepository,
                         ModelMapper modelMapper,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public UserDto updateUserRoles(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Since request.getRoles() already returns Set<Role>, we can use it directly
        user.setRoles(request.getRoles());
        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, UserDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        User user = getUserByUsername(username);
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public UserDto toDto(User user) {
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public UserDto createUser(String username, String email, String password) {
        return toDto(createUser(username, email, password, Set.of(ERole.ROLE_USER.name())));
    }

    @Override
    @Transactional
    public User createUser(String username, String email, String password, Set<String> strRoles) {
        if (existsByUsername(username)) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        Set<Role> roles = new HashSet<>();
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: ROLE_USER is not found."));
            roles.add(userRole);
        } else {
            for (String role : strRoles) {
                switch (role) {
                    case "ROLE_ADMIN":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: ROLE_ADMIN is not found."));
                        roles.add(adminRole);
                        break;
                    case "ROLE_USER":
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: ROLE_USER is not found."));
                        roles.add(userRole);
                }
            }
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    @Transactional
    public void addRoleToUser(String username, ERole roleName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName.name()));
        
        user.addRole(role);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, ERole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Clear existing roles and add the new one
        user.getRoles().clear();
        Role newRole = roleRepository.findByName(role)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + role));
        
        user.getRoles().add(newRole);
        userRepository.save(user);
    }
}
