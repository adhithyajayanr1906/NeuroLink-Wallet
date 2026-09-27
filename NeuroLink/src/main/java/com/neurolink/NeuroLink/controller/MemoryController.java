package com.neurolink.NeuroLink.controller;

import com.neurolink.NeuroLink.dto.MemoryRequest;
import com.neurolink.NeuroLink.dto.MemoryResponse;
import com.neurolink.NeuroLink.service.MemoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memories")
@CrossOrigin(origins = "*")
public class MemoryController {

    private final MemoryService memoryService;

    public MemoryController(MemoryService memoryService) {
        this.memoryService = memoryService;
    }

    @PostMapping
    public ResponseEntity<MemoryResponse> createMemory(
            @RequestParam Long userId,
            @RequestBody MemoryRequest request) {

        return ResponseEntity.ok(
                memoryService.createMemory(userId, request)
        );
    }

    @GetMapping
    public ResponseEntity<List<MemoryResponse>> getMemories(
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                memoryService.getUserMemories(userId)
        );
    }

    @GetMapping("/{memoryId}")
    public ResponseEntity<MemoryResponse> getMemory(
            @RequestParam Long userId,
            @PathVariable Long memoryId) {

        return ResponseEntity.ok(
                memoryService.getMemory(userId, memoryId)
        );
    }

    @PutMapping("/{memoryId}")
    public ResponseEntity<MemoryResponse> updateMemory(
            @RequestParam Long userId,
            @PathVariable Long memoryId,
            @RequestBody MemoryRequest request) {

        return ResponseEntity.ok(
                memoryService.updateMemory(
                        userId,
                        memoryId,
                        request
                )
        );
    }

    @DeleteMapping("/{memoryId}")
    public ResponseEntity<String> deleteMemory(
            @RequestParam Long userId,
            @PathVariable Long memoryId) {

        memoryService.deleteMemory(userId, memoryId);

        return ResponseEntity.ok("Memory deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<MemoryResponse>> searchMemories(
            @RequestParam Long userId,
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                memoryService.searchMemories(userId, keyword)
        );
    }
}