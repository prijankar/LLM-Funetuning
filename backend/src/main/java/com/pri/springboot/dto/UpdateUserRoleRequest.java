package com.pri.springboot.dto;

import com.pri.springboot.entity.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Roles cannot be null")
    @Size(min = 1, message = "At least one role must be specified")
    private Set<Role> roles;

    public UpdateUserRoleRequest() {
    }

    public UpdateUserRoleRequest(Set<Role> roles) {
        this.roles = roles;
    }
}
