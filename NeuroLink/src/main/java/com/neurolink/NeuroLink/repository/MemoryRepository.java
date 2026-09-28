package com.neurolink.NeuroLink.repository;

import com.neurolink.NeuroLink.model.Memory;
import com.neurolink.NeuroLink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemoryRepository extends JpaRepository<Memory, Long> {

    List<Memory> findByUser(User user);

    List<Memory> findByUserAndTitleContainingIgnoreCase(
            User user,
            String title
    );

    @Query("SELECT m FROM Memory m WHERE m.user = :user AND (" +
           "LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.people) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.mood) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
           ")")
    List<Memory> searchUserMemories(
            @Param("user") User user,
            @Param("keyword") String keyword
    );
}
