package com.campus.redbook.controller;

import com.campus.redbook.entity.CommentEntity;
import com.campus.redbook.entity.NoteEntity;
import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.service.NoteService;
import com.campus.redbook.service.ProfileService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NotesController {
    private final NoteService noteService;
    private final ProfileService profileService;

    public NotesController(NoteService noteService, ProfileService profileService) {
        this.noteService = noteService;
        this.profileService = profileService;
    }

    @GetMapping
    public List<NoteEntity> listNotes() {
        return noteService.listNotes();
    }

    @GetMapping("/{id}")
    public NoteEntity getNote(@PathVariable long id) {
        return noteService.getNote(id);
    }

    public record CreateNoteRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String type,
        List<String> media,
        List<String> tags,
        Long topicId,
        String subtitle,
        String cover
    ) {}

    @PostMapping
    public NoteEntity createNote(
        @RequestAttribute("userId") Long userId,
        @RequestBody CreateNoteRequest request
    ) {
        UserProfileEntity profile = profileService.getProfile(userId);
        NoteEntity note = new NoteEntity();
        note.setTitle(request.title());
        note.setContent(request.content());
        note.setType(request.type());
        note.setMedia(request.media() == null ? List.of() : request.media());
        note.setTags(request.tags() == null ? List.of() : request.tags());
        note.setTopicId(request.topicId());
        note.setSubtitle(request.subtitle());
        note.setCover(request.cover());
        note.setAuthor(profile.getName());
        note.setAuthorId(String.valueOf(userId));

        return noteService.create(note);
    }

    @PostMapping("/{id}/like")
    public NoteEntity toggleLike(@RequestAttribute("userId") Long userId, @PathVariable long id) {
        UserProfileEntity profile = profileService.getProfile(userId);
        return noteService.toggleLike(id, profile);
    }

    @PostMapping("/{id}/favorite")
    public NoteEntity toggleFavorite(@RequestAttribute("userId") Long userId, @PathVariable long id) {
        UserProfileEntity profile = profileService.getProfile(userId);
        return noteService.toggleFavorite(id, profile);
    }

    public record CommentRequest(@NotBlank String content, Long parentId) {}

    @PostMapping("/{id}/comments")
    public CommentEntity addComment(
        @RequestAttribute("userId") Long userId,
        @PathVariable long id,
        @RequestBody CommentRequest request
    ) {
        UserProfileEntity profile = profileService.getProfile(userId);
        CommentEntity comment = new CommentEntity();
        comment.setAuthor(profile.getName());
        comment.setAuthorId(String.valueOf(profile.getId()));
        comment.setContent(request.content());
        comment.setParentId(request.parentId());
        return noteService.addComment(id, comment);
    }

    @DeleteMapping("/comments/{commentId}")
    public Map<String, Object> deleteComment(@PathVariable long commentId) {
        boolean deleted = noteService.deleteComment(commentId);
        return Map.of("success", deleted);
    }
}
