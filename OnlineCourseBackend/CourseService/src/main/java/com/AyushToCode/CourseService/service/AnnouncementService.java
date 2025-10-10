package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.AnnouncementRequestDTO;
import com.AyushToCode.CourseService.DTO.AnnouncementResponseDTO;
import com.AyushToCode.CourseService.DTO.EmailDTO;
import com.AyushToCode.CourseService.client.MyLearningClient;
import com.AyushToCode.CourseService.entity.Announcements;
import com.AyushToCode.CourseService.repo.AnnouncementRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepo announcementRepo;
    private final MyLearningClient myLearningClient;
    private final StreamBridge streamBridge;

    public void postAnnouncements(AnnouncementRequestDTO announcementRequestDTO, String userEmail, Long id) {
        Announcements announcements = new Announcements();
        announcements.setCourseId(id);
        announcements.setAnnouncementTitle(announcementRequestDTO.getAnnouncementTitle());
        announcements.setAnnouncementDescription(announcementRequestDTO.getAnnouncementDescription());
        announcements.setEmail(userEmail);

        Announcements savedAnnouncement = announcementRepo.save(announcements);
        sendEmail(userEmail, id);
    }

    private void sendEmail(String userEmail, Long courseId) {
        List<String> allEmailOnCourseId = myLearningClient.getAllEmailOnCourseId(courseId).getBody();
        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setEmail(userEmail);
        emailDTO.setAllEmailOnCourseId(allEmailOnCourseId);
        System.out.println("Calling the rabbit mq..........");
        var result = streamBridge.send("sendEmail-out-0", emailDTO);

    }

    public List<AnnouncementResponseDTO> getAnnouncements(Long id) {
        List<Announcements> announcements = announcementRepo.findByCourseId(id);
        return announcements.stream().map(announce -> {
            AnnouncementResponseDTO announcement = new AnnouncementResponseDTO();
            announcement.setAnnouncementDescription(announce.getAnnouncementDescription());
            announcement.setEmail(announce.getEmail());
            announcement.setAnnouncementTitle(announce.getAnnouncementTitle());
            announcement.setCreatedAt(announce.getCreatedAt());
            announcement.setId(announce.getId());
            return announcement;
        }).toList();
    }

    public List<AnnouncementResponseDTO> getAllAnnouncements(String userEmail) {
        // Step 1: Call the mylearning-service via Feign to get the list of course IDs
        // the user is enrolled in.
        List<Long> courseIds = myLearningClient.getAllCourseIdsOnEmail(userEmail).getBody();

        // Step 2: If the user is not enrolled in any courses, return an empty list
        // to avoid an unnecessary database call.
        if (courseIds == null || courseIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Step 3: Fetch ONLY the relevant announcements from the database using the
        // new repository method. This is much more efficient than findAll().
        List<Announcements> announcements = announcementRepo.findByCourseIdIn(courseIds);

        // Step 4: Map the filtered list of announcement entities to your response DTO.
        return announcements.stream().map(announce -> {
            AnnouncementResponseDTO announcementDTO = new AnnouncementResponseDTO();
            announcementDTO.setAnnouncementDescription(announce.getAnnouncementDescription());
            announcementDTO.setEmail(announce.getEmail());
            announcementDTO.setAnnouncementTitle(announce.getAnnouncementTitle());
            announcementDTO.setCreatedAt(announce.getCreatedAt());
            announcementDTO.setId(announce.getId());
            return announcementDTO;
        }).toList();
    }
}
