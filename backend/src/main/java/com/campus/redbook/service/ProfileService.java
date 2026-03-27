package com.campus.redbook.service;

import com.campus.redbook.entity.UserEntity;
import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileEntity getProfile(Long userId) {
        UserEntity user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        return user.getProfile();
    }

    public UserProfileEntity updateProfile(Long userId, UserProfileEntity updates) {
        UserEntity user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        UserProfileEntity profile = user.getProfile();
        profile.setName(updates.getName());
        profile.setBio(updates.getBio());
        profile.setAvatar(updates.getAvatar());
        profile.setTags(updates.getTags());
        user.setProfile(profile);
        userRepository.save(user);
        return profile;
    }
}
