package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.AnnouncementRequestDTO;
import com.AyushToCode.CourseService.DTO.AnnouncementResponseDTO;
import com.AyushToCode.CourseService.entity.Announcements;
import com.AyushToCode.CourseService.repo.AnnouncementRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepo announcementRepo;

    public void postAnnouncements(AnnouncementRequestDTO announcementRequestDTO, String userEmail, Long id) {
        Announcements announcements = new Announcements();
        announcements.setJobId(id);
        announcements.setAnnouncementTitle(announcementRequestDTO.getAnnouncementTitle());
        announcements.setAnnouncementDescription(announcementRequestDTO.getAnnouncementDescription());
        announcements.setEmail(userEmail);

        announcementRepo.save(announcements);
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
