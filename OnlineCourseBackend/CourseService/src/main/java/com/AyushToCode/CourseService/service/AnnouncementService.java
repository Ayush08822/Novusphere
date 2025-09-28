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
        announcements.setJobId(id);
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
        List<Announcements> announcements = announcementRepo.findByJobId(id);
        return announcements.stream().map(announce ->{
            AnnouncementResponseDTO announcement = new AnnouncementResponseDTO();
            announcement.setAnnouncementDescription(announce.getAnnouncementDescription());
            announcement.setEmail(announce.getEmail());
            announcement.setAnnouncementTitle(announce.getAnnouncementTitle());
            announcement.setCreatedAt(announce.getCreatedAt());
            announcement.setId(announce.getId());
            return announcement;
        }).toList();
    }
}
