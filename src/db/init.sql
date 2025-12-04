DO $$
DECLARE
    lecturer_id_var INTEGER;
    class_id_var INTEGER;
    assignment_id_var INTEGER;
BEGIN
    -- Get lecturer ID
    SELECT id INTO lecturer_id_var FROM users WHERE role = 'lecturer' LIMIT 1;
    
    IF lecturer_id_var IS NOT NULL THEN
        -- Create sample class
        INSERT INTO classes (name, code, description, lecturer_id)
        VALUES ('Network Security', 'NETSEC101', 'Introduction to Network Security and Penetration Testing', lecturer_id_var)
        ON CONFLICT (code) DO NOTHING
        RETURNING id INTO class_id_var;
        
        -- Get class ID if it was just created or already exists
        SELECT id INTO class_id_var FROM classes WHERE code = 'NETSEC101';
        
        IF class_id_var IS NOT NULL THEN
            -- Enroll students
            INSERT INTO class_enrollments (class_id, student_id)
            SELECT class_id_var, id FROM users WHERE role = 'student'
            ON CONFLICT DO NOTHING;
            
            -- Create sample assignment
            INSERT INTO assignments (class_id, title, description, due_date, created_by)
            VALUES (
                class_id_var,
                'Assignment 1: Security Analysis',
                'Upload your security analysis report. Make sure to include all findings.',
                CURRENT_TIMESTAMP + INTERVAL '7 days',
                lecturer_id_var
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

