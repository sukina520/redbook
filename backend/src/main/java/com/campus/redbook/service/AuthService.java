package com.campus.redbook.service;

import com.campus.redbook.entity.UserEntity;
import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public Map<String, Object> register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("用户名已存在");
        }
        UserProfileEntity profile = new UserProfileEntity();
        profile.setName(username);
        profile.setBio("欢迎来到校园红书！");
        profile.setAvatar("https://picsum.photos/seed/avatar-default/120/120");

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setProfile(profile);
        UserEntity saved = userRepository.save(user);

        String token = jwtService.generate(saved.getId(), saved.getUsername());
        return Map.of(
            "token", token,
            "profile", saved.getProfile()
        );
    }

    public Map<String, Object> login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("用户名或密码不正确"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("用户名或密码不正确");
        }
        String token = jwtService.generate(user.getId(), user.getUsername());
        return Map.of(
            "token", token,
            "profile", user.getProfile()
        );
    }
}
