export interface TodayViewStudent {
    id: string;
    name: string;
    admission_number: string;
    class: string | null;
    section: string | null;
    roll_number: number | null;
}

export interface TodayViewTimeSlot {
    start_time: string;
    end_time: string;
    duration_minutes: number;
    slot_type: string;
    name: string;
}

export interface TodayViewSubject {
    id: string | null;
    name: string;
    code: string | null;
}

export interface TodayViewTeacher {
    id: string | null;
    name: string | null;
}

export interface TodayViewPeriod {
    period_number: number;
    time_slot: TodayViewTimeSlot | null;
    subject: TodayViewSubject | null;
    teacher: TodayViewTeacher | null;
    room_number: string;
    is_substitution: boolean;
    substitution_reason: string | null;
}

export interface TodayViewTimetable {
    is_holiday: boolean;
    holiday_name?: string;
    periods: TodayViewPeriod[];
    total_periods?: number;
}

export interface TodayViewHomework {
    id: string;
    title: string;
    subject: TodayViewSubject;
    teacher: TodayViewTeacher;
    due_date: string;
    due_date_display: string;
    submission_status: string;
    is_due_today: boolean;
    is_overdue: boolean;
    priority: string;
}

export interface TodayViewFeeItem {
    id: string;
    category: string;
    balance: number;
    due_date: string;
    due_date_display: string;
    status: string;
    is_overdue: boolean;
}

export interface TodayViewFeesDue {
    total_due: number;
    overdue_amount: number;
    due_today_amount: number;
    upcoming_fees: TodayViewFeeItem[];
    has_overdue: boolean;
}

export interface TodayViewTeacherRemark {
    id: string;
    type: string;
    title: string;
    content: string;
    created_at: string;
    created_at_display: string;
    created_by: string;
    is_important: boolean;
}

export interface TodayViewAttendance {
    marked: boolean;
    status: string | null;
    remarks: string;
    summary: {
        percentage: number;
        present_days: number;
        total_days: number;
    };
}

export interface TodayViewExam {
    id: string;
    exam_name: string;
    subject: string;
    date: string;
    date_display: string;
    start_time: string;
    max_marks: number;
}

export interface TodayViewResponse {
    date: string;
    day_of_week: string;
    student: TodayViewStudent;
    timetable: TodayViewTimetable;
    homework: TodayViewHomework[];
    fees_due: TodayViewFeesDue;
    teacher_remarks: TodayViewTeacherRemark[];
    attendance: TodayViewAttendance;
    exams: TodayViewExam[];
    generated_at: string;
    _cache_hit?: boolean;
}

export interface ParentTodayViewResponse {
    date: string;
    children: TodayViewResponse[];
    children_count: number;
    generated_at: string;
    _cache_hit?: boolean;
}
