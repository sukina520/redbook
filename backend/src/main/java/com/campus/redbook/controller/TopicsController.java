package com.campus.redbook.controller;

import com.campus.redbook.entity.NoteEntity;
import com.campus.redbook.entity.TopicEntity;
import com.campus.redbook.repo.TopicRepository;
import com.campus.redbook.service.NoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicsController {
    private final TopicRepository topicRepository;
    private final NoteService noteService;

    public TopicsController(TopicRepository topicRepository, NoteService noteService) {
        this.topicRepository = topicRepository;
        this.noteService = noteService;
    }

    @GetMapping
    public List<TopicEntity> listTopics() {
        return topicRepository.findAll();
    }

    @GetMapping("/{id}/notes")
    public List<NoteEntity> notesByTopic(@PathVariable long id) {
        return noteService.listByTopic(id);
    }
}
