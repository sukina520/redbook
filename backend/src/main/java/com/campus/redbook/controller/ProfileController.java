package com.campus.redbook.controller;

import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.service.ProfileService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserProfileEntity getProfile(@RequestAttribute("userId") Long userId) {
        return profileService.getProfile(userId);
    }

    public record UpdateProfileRequest(
        @NotBlank String name,
        String bio,
        String avatar,
        List<String> tags
    ) {}

    @PutMapping
    public UserProfileEntity updateProfile(
        @RequestAttribute("userId") Long userId,
        @RequestBody UpdateProfileRequest request
    ) {
        UserProfileEntity updates = new UserProfileEntity();
        updates.setName(request.name());
        updates.setBio(request.bio());
        updates.setAvatar(request.avatar());
        updates.setTags(request.tags() == null ? List.of() : request.tags());
        return profileService.updateProfile(userId, updates);
    }
}
