package com.campus.redbook.service;

import com.campus.redbook.entity.CommentEntity;
import com.campus.redbook.entity.NoteEntity;
import com.campus.redbook.entity.TopicEntity;
import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.repo.CommentRepository;
import com.campus.redbook.repo.NoteRepository;
import com.campus.redbook.repo.TopicRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final TopicRepository topicRepository;
    private final CommentRepository commentRepository;

    public NoteService(NoteRepository noteRepository, TopicRepository topicRepository, CommentRepository commentRepository) {
        this.noteRepository = noteRepository;
        this.topicRepository = topicRepository;
        this.commentRepository = commentRepository;
    }

    public List<NoteEntity> listNotes() {
        return noteRepository.findAll();
    }

    public NoteEntity getNote(long id) {
        return noteRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }

    public List<NoteEntity> listByTopic(long topicId) {
        return noteRepository.findByTopicId(topicId);
    }

    @Transactional
    public NoteEntity create(NoteEntity note) {
        note.setCreatedAt(System.currentTimeMillis());
        note.setLikes(0);
        note.setFavorites(0);
        note.setViews(0);
        if (note.getCover() == null && note.getMedia() != null && !note.getMedia().isEmpty()) {
            note.setCover(note.getMedia().get(0));
        }

        NoteEntity saved = noteRepository.save(note);

        if (note.getTopicId() != null) {
            TopicEntity topic = topicRepository.findById(note.getTopicId()).orElse(null);
            if (topic != null) {
                topic.setNotes(topic.getNotes() + 1);
                topic.setParticipants(topic.getParticipants() + 1);
                topicRepository.save(topic);
            }
        }

        return saved;
    }

    @Transactional
    public NoteEntity toggleLike(long noteId, UserProfileEntity profile) {
        NoteEntity note = getNote(noteId);
        String userKey = profile.getId().toString();
        if (note.getLikedUsers().contains(userKey)) {
            note.getLikedUsers().remove(userKey);
            note.setLikes(Math.max(0, note.getLikes() - 1));
        } else {
            note.getLikedUsers().add(userKey);
            note.setLikes(note.getLikes() + 1);
        }
        return noteRepository.save(note);
    }

    @Transactional
    public NoteEntity toggleFavorite(long noteId, UserProfileEntity profile) {
        NoteEntity note = getNote(noteId);
        String userKey = profile.getId().toString();
        if (note.getFavoredUsers().contains(userKey)) {
            note.getFavoredUsers().remove(userKey);
            note.setFavorites(Math.max(0, note.getFavorites() - 1));
        } else {
            note.getFavoredUsers().add(userKey);
            note.setFavorites(note.getFavorites() + 1);
        }
        return noteRepository.save(note);
    }

    @Transactional
    public CommentEntity addComment(long noteId, CommentEntity comment) {
        NoteEntity note = getNote(noteId);
        comment.setCreatedAt(System.currentTimeMillis());
        comment.setDeleted(false);
        comment.setNote(note);
        CommentEntity saved = commentRepository.save(comment);
        note.getComments().add(saved);
        noteRepository.save(note);
        return saved;
    }

    @Transactional
    public boolean deleteComment(long commentId) {
        CommentEntity comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) return false;
        comment.setDeleted(true);
        commentRepository.save(comment);
        return true;
    }
}
