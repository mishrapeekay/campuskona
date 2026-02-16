import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<any> = {
    prefixes: ['schoolapp://', 'https://app.schoolmgmt.com'],
    config: {
        screens: {
            TenantSelection: 'tenant',
            Auth: {
                screens: {
                    Login: 'login',
                },
            },
            MainDrawer: {
                screens: {
                    MainTabs: {
                        screens: {
                            HomeTab: {
                                screens: {
                                    Dashboard: 'dashboard',
                                    Announcements: 'announcements',
                                },
                            },
                            AcademicsTab: {
                                screens: {
                                    AcademicsHome: 'academics',
                                    AttendanceOverview: 'attendance',
                                    ExamList: 'exams',
                                },
                            },
                            ServicesTab: {
                                screens: {
                                    ServicesHome: 'services',
                                    Messages: 'messages',
                                    NoticeBoard: 'notices',
                                },
                            },
                            ProfileTab: {
                                screens: {
                                    ProfileOverview: 'profile',
                                    NotificationHistory: 'notifications',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
