package com.securekyc.securekyc_backend.repository;

import com.securekyc.securekyc_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndPassword(String email, String password);
    boolean existsByEmail(String email);
    boolean existsByEmployeeId(String employeeId);
    java.util.List<User> findByRoleAndActiveTrue(User.Role role);
    java.util.List<User> findByRole(User.Role role);
}
