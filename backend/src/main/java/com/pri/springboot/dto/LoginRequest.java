package com.pri.springboot.dto;

public class LoginRequest {
    private String username;
    private String email;
    private String password;

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Helper method to get the login identifier (either email or username)
    public String getLoginIdentifier() {
        return email != null && !email.isEmpty() ? email : username;
    }
}
