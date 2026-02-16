import React, { useState, useEffect } from 'react'
import { useFeature } from '../../hooks/useFeature'
import { getParentDashboard, getChildResults, getChildFees } from '../../api/parentPortal'

const statusColors = {
    PRESENT: '#059669',
    ABSENT: '#DC2626',
    LATE: '#F59E0B',
    HALF_DAY: '#D97706',
    LEAVE: '#6366F1',
    HOLIDAY: '#9CA3AF',
}

const ParentDashboard = () => {
    const hasParentPortal = useFeature('parent_portal')
    const [dashboard, setDashboard] = useState(null)
    const [selectedChild, setSelectedChild] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('overview')

    useEffect(() => {
        fetchDashboard()
    }, [selectedChild])

    const fetchDashboard = async () => {
        setLoading(true)
        try {
            const res = await getParentDashboard(selectedChild)
            setDashboard(res.data)
            if (!selectedChild && res.data.children?.length > 0) {
                setSelectedChild(res.data.children[0].student_id)
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (!hasParentPortal) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128106;</div>
                <h2 style={{ color: '#1F2937', marginBottom: '8px' }}>Parent Engagement Portal</h2>
                <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                    Track your child's attendance, results, fees, and school activities.
                </p>
                <div style={{
                    display: 'inline-block', padding: '8px 16px',
                    backgroundColor: '#DBEAFE', color: '#1E40AF',
                    borderRadius: '8px', fontSize: '14px', fontWeight: '500'
                }}>
                    Available on Standard plan and above
                </div>
            </div>
        )
    }

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading dashboard...</div>
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#DC2626' }}>{error}</p>
                <button onClick={fetchDashboard} style={{
                    marginTop: '12px', padding: '8px 16px', backgroundColor: '#4F46E5',
                    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
                }}>Retry</button>
            </div>
        )
    }

    const children = dashboard?.children || []
    const currentChild = children.find(c => c.student_id === selectedChild) || children[0]

    return (
        <div style={{ padding: '24px' }}>
            {/* Header with child selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>Parent Dashboard</h1>
                {children.length > 1 && (
                    <select
                        value={selectedChild || ''}
                        onChange={(e) => setSelectedChild(parseInt(e.target.value))}
                        style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                    >
                        {children.map(child => (
                            <option key={child.student_id} value={child.student_id}>
                                {child.name} ({child.relation})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Navigation tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #E5E7EB', paddingBottom: '2px' }}>
                {['overview', 'attendance', 'results', 'fees'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSection(tab)}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: 'transparent',
                            color: activeSection === tab ? '#4F46E5' : '#6B7280',
                            border: 'none',
                            borderBottom: activeSection === tab ? '2px solid #4F46E5' : '2px solid transparent',
                            cursor: 'pointer',
                            fontWeight: activeSection === tab ? '600' : '400',
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            marginBottom: '-2px',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {currentChild && (
                <>
                    {/* Student Info Card */}
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '20px',
                    }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            backgroundColor: '#E0E7FF', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#4F46E5'
                        }}>
                            {currentChild.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                                {currentChild.name}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                                {currentChild.enrollment?.class} - {currentChild.enrollment?.section}
                                {currentChild.enrollment?.roll_number && ` | Roll: ${currentChild.enrollment.roll_number}`}
                                {' | '}{currentChild.admission_number}
                            </p>
                        </div>
                    </div>

                    {activeSection === 'overview' && <OverviewSection child={currentChild} notices={dashboard?.notices} events={dashboard?.events} />}
                    {activeSection === 'attendance' && <AttendanceSection child={currentChild} />}
                    {activeSection === 'results' && <ResultsSection child={currentChild} />}
                    {activeSection === 'fees' && <FeesSection child={currentChild} />}
                </>
            )}
        </div>
    )
}

const StatCard = ({ label, value, color, sub }) => (
    <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, minWidth: '200px'
    }}>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: color || '#1F2937', margin: 0 }}>{value}</p>
        {sub && <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{sub}</p>}
    </div>
)

const OverviewSection = ({ child, notices, events }) => {
    const att = child.attendance
    const fees = child.fee_summary
    const results = child.recent_exam_results || []

    return (
        <div>
            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <StatCard
                    label="Attendance"
                    value={att ? `${att.attendance_percentage}%` : '--'}
                    color={att && att.attendance_percentage >= 75 ? '#059669' : '#DC2626'}
                    sub={att ? `${att.days_present} / ${att.total_working_days} days` : ''}
                />
                <StatCard
                    label="Latest Exam"
                    value={results.length > 0 ? `${results[0].percentage}%` : '--'}
                    color={results.length > 0 && results[0].is_passed ? '#059669' : '#DC2626'}
                    sub={results.length > 0 ? results[0].examination_name : ''}
                />
                <StatCard
                    label="Fee Outstanding"
                    value={fees ? `₹${fees.outstanding.toLocaleString()}` : '--'}
                    color={fees && fees.outstanding > 0 ? '#DC2626' : '#059669'}
                    sub={fees && fees.overdue_count > 0 ? `${fees.overdue_count} overdue` : 'All clear'}
                />
            </div>

            {/* Notices & Events */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>Recent Notices</h3>
                    {(notices || []).length === 0 ? (
                        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No recent notices</p>
                    ) : (
                        notices.map((n, i) => (
                            <div key={i} style={{ padding: '8px 0', borderBottom: i < notices.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <p style={{ fontSize: '14px', color: '#1F2937', fontWeight: '500', margin: 0 }}>{n.title}</p>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>{n.date}</p>
                            </div>
                        ))
                    )}
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>Upcoming Events</h3>
                    {(events || []).length === 0 ? (
                        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>No upcoming events</p>
                    ) : (
                        events.map((e, i) => (
                            <div key={i} style={{ padding: '8px 0', borderBottom: i < events.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <p style={{ fontSize: '14px', color: '#1F2937', fontWeight: '500', margin: 0 }}>{e.title}</p>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>{e.start_date} | {e.location || e.event_type}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

const AttendanceSection = ({ child }) => {
    const att = child.attendance
    if (!att) return <p style={{ color: '#6B7280' }}>Attendance data not available.</p>

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <StatCard label="Total Working Days" value={att.total_working_days} />
                <StatCard label="Days Present" value={att.days_present} color="#059669" />
                <StatCard label="Days Absent" value={att.days_absent} color="#DC2626" />
                <StatCard label="Days Late" value={att.days_late} color="#F59E0B" />
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Last 7 Days</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(att.recent_7_days || []).map((day, i) => (
                        <div key={i} style={{
                            padding: '8px 16px', borderRadius: '8px',
                            backgroundColor: statusColors[day.status] + '15',
                            border: `1px solid ${statusColors[day.status] || '#ccc'}30`,
                            textAlign: 'center', minWidth: '100px',
                        }}>
                            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{day.date}</p>
                            <p style={{
                                fontSize: '13px', fontWeight: '600', margin: '4px 0 0 0',
                                color: statusColors[day.status] || '#374151',
                            }}>{day.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const ResultsSection = ({ child }) => {
    const results = child.recent_exam_results || []

    if (results.length === 0) {
        return <p style={{ color: '#6B7280' }}>No published exam results yet.</p>
    }

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Exam Results</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Examination</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Percentage</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Grade</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Rank</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '10px' }}>{r.examination_name}</td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600' }}>{r.percentage}%</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{r.grade}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{r.rank || '--'}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                <span style={{
                                    padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                    backgroundColor: r.is_passed ? '#D1FAE5' : '#FEE2E2',
                                    color: r.is_passed ? '#065F46' : '#991B1B',
                                }}>{r.is_passed ? 'PASS' : 'FAIL'}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const FeesSection = ({ child }) => {
    const fees = child.fee_summary
    if (!fees) return <p style={{ color: '#6B7280' }}>Fee data not available.</p>

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <StatCard label="Total Fee" value={`₹${fees.total_fee.toLocaleString()}`} />
                <StatCard label="Paid" value={`₹${fees.total_paid.toLocaleString()}`} color="#059669" />
                <StatCard label="Outstanding" value={`₹${fees.outstanding.toLocaleString()}`} color={fees.outstanding > 0 ? '#DC2626' : '#059669'} />
            </div>

            {fees.recent_payments?.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Recent Payments</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F3F4F6' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Receipt</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fees.recent_payments.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '8px' }}>{p.receipt}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>₹{p.amount.toLocaleString()}</td>
                                    <td style={{ padding: '8px', color: '#6B7280' }}>{p.date}</td>
                                    <td style={{ padding: '8px', color: '#6B7280' }}>{p.method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default ParentDashboard
