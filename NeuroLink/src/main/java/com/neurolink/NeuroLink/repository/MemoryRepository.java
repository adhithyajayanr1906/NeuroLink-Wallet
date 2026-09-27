package com.neurolink.NeuroLink.repository;

import com.neurolink.NeuroLink.model.Memory;
import com.neurolink.NeuroLink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemoryRepository extends JpaRepository<Memory, Long> {

    List<Memory> findByUser(User user);

    List<Memory> findByUserAndTitleContainingIgnoreCase(
            User user,
            String title
    );
}
