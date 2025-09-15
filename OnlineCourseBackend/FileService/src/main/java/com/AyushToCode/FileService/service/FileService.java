package com.AyushToCode.FileService.service;

import com.AyushToCode.FileService.DTO.ResponseDTO;
import com.AyushToCode.FileService.client.SectionFeignClient;
import com.AyushToCode.FileService.entity.File;
import com.AyushToCode.FileService.exceptions.FileAlreadyExistException;
import com.AyushToCode.FileService.exceptions.NoSuchSectionFoundException;
import com.AyushToCode.FileService.repo.FileRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class FileService {

    private final FileRepo fileRepo;
    private final SectionFeignClient feignClient;

    public List<ResponseDTO> saveResource(String title, MultipartFile[] files, Long sectionId) throws Exception {
        if (!feignClient.getBooleanValue(sectionId)) {
            throw new NoSuchSectionFoundException("No such section found with the id : " + sectionId);
        }

        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            if (fileRepo.findByName(fileName).isPresent()) {
                throw new FileAlreadyExistException("A file named '" + fileName + "' already exists.");
            }
        }

        // Save each file and build response
        List<ResponseDTO> responseList = new ArrayList<>();
        for (MultipartFile file : files) {
            File resource = new File();
            resource.setName(file.getOriginalFilename());
            resource.setType(file.getContentType());
            resource.setSectionId(sectionId);
            resource.setTitle(title); // Assuming 'title' is a field in your File entity

            try {
                resource.setData(file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file bytes", e);
            }

            File saved = fileRepo.save(resource);

            ResponseDTO dto = new ResponseDTO();
            dto.setId(saved.getId());
            dto.setTitle(saved.getTitle());
            dto.setData(saved.getData());

            responseList.add(dto);
        }

        return responseList;
    }



    public File getResource(Long id) {
        return fileRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    public List<ResponseDTO> getFilesBySectionId(Long sectionId) {
        List<File> files = fileRepo.findBySectionId(sectionId);
        return files.stream().map(file -> {
            ResponseDTO ResponseDTO = new ResponseDTO();
            ResponseDTO.setId(file.getId());
            ResponseDTO.setTitle(file.getTitle());
            ResponseDTO.setType(file.getType());
            ResponseDTO.setData(file.getData());
            return ResponseDTO;
        }).toList();
    }
}
