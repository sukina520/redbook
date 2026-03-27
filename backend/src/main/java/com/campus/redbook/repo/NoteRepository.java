package com.campus.redbook.repo;

import com.campus.redbook.entity.NoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<NoteEntity, Long> {
    List<NoteEntity> findByTopicId(Long topicId);
}
