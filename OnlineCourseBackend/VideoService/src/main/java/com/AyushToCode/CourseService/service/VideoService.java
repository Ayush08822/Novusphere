package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.VideoResponseDTO;
import com.AyushToCode.CourseService.client.SectionFeignClient;
import com.AyushToCode.CourseService.entity.VideoFile;
import com.AyushToCode.CourseService.exceptions.NoSuchSectionFoundException;
import com.AyushToCode.CourseService.exceptions.VideoAlreadyExistException;
import com.AyushToCode.CourseService.repo.VideoRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class VideoService {

    private final VideoRepo videoRepo;
    private final SectionFeignClient feignClient;

    public VideoResponseDTO saveVideo(String title, MultipartFile file, Long sectionId) throws Exception {
        if(!feignClient.getBooleanValue(sectionId)) throw new NoSuchSectionFoundException("No such section found with the id : " + sectionId);
        String fileName = file.getOriginalFilename();

        Optional<VideoFile> existing = videoRepo.findByName(fileName);
        if (existing.isPresent()) {
            throw new VideoAlreadyExistException("A Video named '" + fileName + "' already exists.");
        }

        VideoFile video = new VideoFile();
        video.setTitle(title);
        video.setName(file.getOriginalFilename());
        video.setType(file.getContentType());
        video.setSectionId(sectionId);
        video.setData(file.getBytes());
        VideoFile savedVideo = videoRepo.save(video);

        VideoResponseDTO videoResponseDTO = new VideoResponseDTO();
        videoResponseDTO.setTitle(video.getTitle());
        videoResponseDTO.setId(video.getId());
        videoResponseDTO.setData(video.getData());
        return videoResponseDTO;
    }
    public VideoFile getVideo(Long id) {
        return videoRepo.findById(id).orElseThrow();
    }

    public List<VideoResponseDTO> getVideosBSectionId(Long sectionId) {
        List<VideoFile> videos = videoRepo.findBySectionId(sectionId);
        return videos.stream().map(video -> {
            VideoResponseDTO videoResponseDTO = new VideoResponseDTO();
            videoResponseDTO.setId(video.getId());
            videoResponseDTO.setTitle(video.getTitle());
            videoResponseDTO.setType(video.getType());
            videoResponseDTO.setData(video.getData());
            return videoResponseDTO;
        }).toList();
    }
}
