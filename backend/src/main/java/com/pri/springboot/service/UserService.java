package com.pri.springboot.service;

import com.pri.springboot.dto.UpdateUserRoleRequest;
import com.pri.springboot.dto.UserDto;
import com.pri.springboot.entity.ERole;
import com.pri.springboot.entity.User;

import java.util.List;
import java.util.Set;

public interface UserService {
    List<User> findAllUsers();
    UserDto updateUserRoles(Long userId, UpdateUserRoleRequest request);
    UserDto getCurrentUser(String username);
    UserDto toDto(User user);
    List<UserDto> getAllUsers();
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    UserDto createUser(String username, String email, String password);
    User createUser(String username, String email, String password, Set<String> roles);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    void addRoleToUser(String username, ERole role);
    void updateUserRole(Long userId, ERole role);
}