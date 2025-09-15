package com.AyushToCode.FileService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "courseService")
public interface SectionFeignClient {

    @GetMapping("/api/sections/{sectionId}")
    public Boolean getBooleanValue(@PathVariable Long sectionId);
}
