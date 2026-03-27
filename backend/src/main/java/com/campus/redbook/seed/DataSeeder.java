package com.campus.redbook.seed;

import com.campus.redbook.entity.NoteEntity;
import com.campus.redbook.entity.TopicEntity;
import com.campus.redbook.entity.UserEntity;
import com.campus.redbook.entity.UserProfileEntity;
import com.campus.redbook.repo.NoteRepository;
import com.campus.redbook.repo.TopicRepository;
import com.campus.redbook.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;

    public DataSeeder(TopicRepository topicRepository, UserRepository userRepository, NoteRepository noteRepository) {
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
    }

    @Override
    public void run(String... args) {
        if (topicRepository.count() == 0) {
            topicRepository.save(makeTopic(
                "#春日校园穿搭",
                "记录每天在校园里最上镜的一套穿搭。",
                276,
                1120,
                98,
                "https://picsum.photos/seed/topic-style/800/480"
            ));
            topicRepository.save(makeTopic(
                "#期末自习室打卡",
                "图书馆、自习室、空教室都欢迎来晒。",
                421,
                2048,
                96,
                "https://picsum.photos/seed/topic-study/800/480"
            ));
            topicRepository.save(makeTopic(
                "#食堂新品实测",
                "每周一起帮大家判断哪家窗口值得排队。",
                188,
                689,
                89,
                "https://picsum.photos/seed/topic-food/800/480"
            ));
        }

        if (!userRepository.existsByUsername("demo")) {
            UserProfileEntity profile = new UserProfileEntity();
            profile.setName("小林同学");
            profile.setBio("在校园里认真生活，也认真记录。");
            profile.setAvatar("https://picsum.photos/seed/avatar-lin/120/120");
            profile.setTags(List.of("学习", "运动", "探店"));

            UserEntity user = new UserEntity();
            user.setUsername("demo");
            user.setPasswordHash(new BCryptPasswordEncoder().encode("demo123"));
            user.setProfile(profile);
            userRepository.save(user);
        }

        if (noteRepository.count() == 0) {
            NoteEntity note = new NoteEntity();
            note.setTitle("图书馆四楼超安静，复习效率拉满");
            note.setContent("靠窗位置下午阳光很舒服，推荐带耳机和保温杯，三点后人会明显变多。");
            note.setAuthor("小林同学");
            note.setAuthorId("demo");
            note.setType("image");
            note.setMedia(List.of("https://picsum.photos/seed/library/640/840"));
            note.setTags(List.of("学习"));
            note.setTopicId(topicRepository.findAll().get(1).getId());
            note.setLikes(118);
            note.setFavorites(43);
            note.setCreatedAt(System.currentTimeMillis() - 1000 * 60 * 30);
            note.setCover("https://picsum.photos/seed/library/640/840");
            noteRepository.save(note);
        }
    }

    private TopicEntity makeTopic(String name, String description, int participants, int notes, int heat, String cover) {
        TopicEntity topic = new TopicEntity();
        topic.setName(name);
        topic.setDescription(description);
        topic.setParticipants(participants);
        topic.setNotes(notes);
        topic.setHeat(heat);
        topic.setCover(cover);
        return topic;
    }
}
