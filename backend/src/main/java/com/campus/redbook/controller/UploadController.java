package com.campus.redbook.controller;

import com.campus.redbook.service.StorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/image")
    public Map<String, String> uploadImage(
        @RequestAttribute("userId") Long userId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        StorageService.UploadResult result = storageService.upload("images", file);
        return Map.of(
            "objectKey", result.objectKey(),
            "url", result.url()
        );
    }

    @PostMapping("/video")
    public Map<String, String> uploadVideo(
        @RequestAttribute("userId") Long userId,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        StorageService.UploadResult result = storageService.upload("videos", file);
        return Map.of(
            "objectKey", result.objectKey(),
            "url", result.url()
        );
    }
}
