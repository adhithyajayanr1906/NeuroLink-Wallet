package com.neurolink.NeuroLink.service;

import com.neurolink.NeuroLink.dto.MemoryRequest;
import com.neurolink.NeuroLink.dto.MemoryResponse;
import com.neurolink.NeuroLink.model.Memory;
import com.neurolink.NeuroLink.model.User;
import com.neurolink.NeuroLink.repository.MemoryRepository;
import com.neurolink.NeuroLink.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final UserRepository userRepository;

    public MemoryService(
            MemoryRepository memoryRepository,
            UserRepository userRepository) {

        this.memoryRepository = memoryRepository;
        this.userRepository = userRepository;
    }

    public MemoryResponse createMemory(Long userId, MemoryRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Memory memory = Memory.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .memoryDate(request.getMemoryDate())
                .category(request.getCategory())
                .location(request.getLocation())
                .people(request.getPeople())
                .mood(request.getMood())
                .tags(request.getTags())
                .mediaUrl(request.getMediaUrl())
                .mediaType(request.getMediaType())
                .user(user)
                .build();

        Memory savedMemory = memoryRepository.save(memory);

        return convertToResponse(savedMemory);
    }

    public List<MemoryResponse> getUserMemories(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return memoryRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public MemoryResponse getMemory(Long userId, Long memoryId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Memory memory = memoryRepository.findById(memoryId)
                .orElseThrow(() -> new RuntimeException("Memory not found"));

        if (!memory.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have access to this memory");
        }

        return convertToResponse(memory);
    }

    public MemoryResponse updateMemory(
            Long userId,
            Long memoryId,
            MemoryRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Memory memory = memoryRepository.findById(memoryId)
                .orElseThrow(() -> new RuntimeException("Memory not found"));

        if (!memory.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have access to this memory");
        }

        memory.setTitle(request.getTitle());
        memory.setDescription(request.getDescription());
        memory.setMemoryDate(request.getMemoryDate());
        memory.setCategory(request.getCategory());
        memory.setLocation(request.getLocation());
        memory.setPeople(request.getPeople());
        memory.setMood(request.getMood());
        memory.setTags(request.getTags());
        memory.setMediaUrl(request.getMediaUrl());
        memory.setMediaType(request.getMediaType());

        Memory updatedMemory = memoryRepository.save(memory);

        return convertToResponse(updatedMemory);
    }

    public void deleteMemory(Long userId, Long memoryId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Memory memory = memoryRepository.findById(memoryId)
                .orElseThrow(() -> new RuntimeException("Memory not found"));

        if (!memory.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have access to this memory");
        }

        memoryRepository.delete(memory);
    }

    public List<MemoryResponse> searchMemories(
            Long userId,
            String keyword) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (keyword == null || keyword.trim().isEmpty()) {
            return getUserMemories(userId);
        }

        return memoryRepository
                .searchUserMemories(user, keyword.trim())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private MemoryResponse convertToResponse(Memory memory) {

        return MemoryResponse.builder()
                .id(memory.getId())
                .title(memory.getTitle())
                .description(memory.getDescription())
                .memoryDate(memory.getMemoryDate())
                .category(memory.getCategory())
                .location(memory.getLocation())
                .people(memory.getPeople())
                .mood(memory.getMood())
                .tags(memory.getTags())
                .mediaUrl(memory.getMediaUrl())
                .mediaType(memory.getMediaType())
                .createdAt(memory.getCreatedAt())
                .updatedAt(memory.getUpdatedAt())
                .build();
    }
}