import {
    Award,
    Trophy,
    Star,
    Shield,
    Medal,
    Share2,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const AchievementsLocker = () => {
    // Mock Data
    const achievements = [
        { id: 1, title: 'Top Scorer: Mathematics', date: '2023-12-15', category: 'ACADEMIC', icon: Trophy, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
        { id: 2, title: 'Science Fair Winner', date: '2023-11-20', category: 'COMPETITION', icon: Medal, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
        { id: 3, title: 'Perfect Attendance - Term 1', date: '2023-10-30', category: 'PERFORMANCE', icon: Star, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
        { id: 4, title: 'Debate Champion', date: '2023-09-10', category: 'EXTRACURRICULAR', icon: Shield, color: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30' },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-8 max-w-6xl mx-auto p-6">
                <PageHeader
                    title="My Achievements"
                    description="Your personal hall of fame. Celebrate your milestones and awards."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Achievements', active: true },
                    ]}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Summary Stats */}
                    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-amber-100 text-sm font-medium uppercase tracking-wider">Total Awards</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Trophy className="h-10 w-10 text-white/80" />
                                <span className="text-4xl font-bold">{achievements.length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/20 border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-violet-100 text-sm font-medium uppercase tracking-wider">House Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Shield className="h-10 w-10 text-white/80" />
                                <span className="text-4xl font-bold">1,250</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {achievements.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className={`absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity bg-current ${item.color.split(' ')[0]}`} />

                            <CardHeader className="flex flex-col items-center text-center pb-2">
                                <div className={`p-4 rounded-full mb-4 shadow-sm ${item.color}`}>
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <Badge variant="outline" className="mb-2 text-[10px] uppercase font-semibold opacity-70">
                                    {item.category}
                                </Badge>
                                <CardTitle className="text-base font-bold leading-tight line-clamp-2">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="text-xs font-medium mt-1">
                                    Awarded on {new Date(item.date).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-2 flex justify-center gap-3">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" title="Download Certificate">
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" title="Share Achievement">
                                    <Share2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Empty State / Add Future Goals */}
                    <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="p-4 rounded-full bg-muted/50 mb-4 group-hover:bg-muted/80 transition-colors">
                            <Star className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="font-semibold text-foreground">Next Goal</h3>
                        <p className="text-xs mt-1 max-w-[150px]">Stay consistent to earn the 'Perfect Attendance' badge for Term 2!</p>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default AchievementsLocker;
