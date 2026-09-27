package com.neurolink.NeuroLink.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MemoryResponse {

    private Long id;

    private String title;

    private String description;

    private LocalDate memoryDate;

    private String category;

    private String location;

    private String people;

    private String mood;

    private String tags;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
