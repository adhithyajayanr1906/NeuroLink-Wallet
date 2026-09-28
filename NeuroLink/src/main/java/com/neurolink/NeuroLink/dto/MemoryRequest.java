package com.neurolink.NeuroLink.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MemoryRequest {

    private String title;

    private String description;

    private LocalDate memoryDate;

    private String category;

    private String location;

    private String people;

    private String mood;

    private String tags;

    private String mediaUrl;

    private String mediaType;
}