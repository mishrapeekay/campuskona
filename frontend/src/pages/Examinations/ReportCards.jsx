import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    getReportCards,
    getReportCardTemplates,
    generateReportCard,
    generateBulkReportCards,
    downloadReportCardPdf,
} from '../../api/examinations'
import { getExaminations, getClassResults } from '../../api/examinations'
import { useFeature } from '../../hooks/useFeature'

const ReportCards = () => {
    const hasReportCardEngine = useFeature('report_card_engine')
    const { user } = useSelector((state) => state.auth)

    const [reportCards, setReportCards] = useState([])
    const [templates, setTemplates] = useState([])
    const [examinations, setExaminations] = useState([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState('list')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Generation form state
    const [genForm, setGenForm] = useState({
        examination_id: '',
        class_id: '',
        section_id: '',
        template_id: '',
        generate_pdf: true,
    })

    useEffect(() => {
        fetchReportCards()
        if (hasReportCardEngine) {
            fetchTemplates()
            fetchExaminations()
        }
    }, [hasReportCardEngine])

    const fetchReportCards = async () => {
        setLoading(true)
        try {
            const res = await getReportCards()
            setReportCards(res.data.results || res.data)
        } catch (err) {
            setError('Failed to load report cards')
        } finally {
            setLoading(false)
        }
    }

    const fetchTemplates = async () => {
        try {
            const res = await getReportCardTemplates({ is_active: true })
            setTemplates(res.data.results || res.data)
        } catch (err) {
            console.warn('Could not load templates:', err)
        }
    }

    const fetchExaminations = async () => {
        try {
            const res = await getExaminations({ status: 'COMPLETED' })
            setExaminations(res.data.results || res.data)
        } catch (err) {
            console.warn('Could not load examinations:', err)
        }
    }

    const handleGenerate = async (e) => {
        e.preventDefault()
        setGenerating(true)
        setError(null)
        setSuccess(null)

        try {
            const payload = {
                examination_id: parseInt(genForm.examination_id),
                class_id: parseInt(genForm.class_id),
                section_id: parseInt(genForm.section_id),
                generate_pdf: genForm.generate_pdf,
            }
            if (genForm.template_id) {
                payload.template_id = parseInt(genForm.template_id)
            }

            const res = await generateBulkReportCards(payload)
            setSuccess(`Generated ${res.data.generated} report card(s)`)
            fetchReportCards()
            setActiveTab('list')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate report cards')
        } finally {
            setGenerating(false)
        }
    }

    const handleDownload = async (id) => {
        try {
            const res = await downloadReportCardPdf(id)
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `report_card_${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError('Failed to download PDF')
        }
    }

    if (!hasReportCardEngine) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#128196;</div>
                <h2 style={{ color: '#1F2937', marginBottom: '8px' }}>Report Card Engine</h2>
                <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                    Generate professional PDF report cards with customizable templates.
                </p>
                <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Available on Premium plan and above
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>Report Cards</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: activeTab === 'list' ? '#4F46E5' : '#E5E7EB',
                            color: activeTab === 'list' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        View Report Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('generate')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: activeTab === 'generate' ? '#4F46E5' : '#E5E7EB',
                            color: activeTab === 'generate' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Generate Report Cards
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ color: '#DC2626', fontSize: '14px' }}>{error}</p>
                </div>
            )}

            {success && (
                <div style={{ padding: '12px', backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ color: '#065F46', fontSize: '14px' }}>{success}</p>
                </div>
            )}

            {activeTab === 'list' && (
                <div>
                    {loading ? (
                        <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>Loading report cards...</p>
                    ) : reportCards.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                            <p>No report cards generated yet.</p>
                            <button
                                onClick={() => setActiveTab('generate')}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    backgroundColor: '#4F46E5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Generate Now
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Examination</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Generated</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>PDF</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportCards.map((card) => (
                                        <tr key={card.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td style={{ padding: '12px' }}>{card.student_name}</td>
                                            <td style={{ padding: '12px' }}>{card.examination_name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: card.is_cumulative ? '#EDE9FE' : '#DBEAFE',
                                                    color: card.is_cumulative ? '#7C3AED' : '#2563EB',
                                                }}>
                                                    {card.is_cumulative ? 'Cumulative' : 'Single'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#6B7280', fontSize: '13px' }}>
                                                {new Date(card.generated_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {card.pdf_file ? (
                                                    <span style={{ color: '#059669', fontWeight: '500' }}>Ready</span>
                                                ) : (
                                                    <span style={{ color: '#9CA3AF' }}>--</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDownload(card.id)}
                                                    style={{
                                                        padding: '4px 12px',
                                                        backgroundColor: '#4F46E5',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'generate' && (
                <div style={{ maxWidth: '600px' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginBottom: '20px' }}>
                            Bulk Generate Report Cards
                        </h2>
                        <form onSubmit={handleGenerate}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                    Examination *
                                </label>
                                <select
                                    value={genForm.examination_id}
                                    onChange={(e) => setGenForm({ ...genForm, examination_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px' }}
                                    required
                                >
                                    <option value="">Select examination</option>
                                    {examinations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                        Class ID *
                                    </label>
                                    <input
                                        type="number"
                                        value={genForm.class_id}
                                        onChange={(e) => setGenForm({ ...genForm, class_id: e.target.value })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                        Section ID *
                                    </label>
                                    <input
                                        type="number"
                                        value={genForm.section_id}
                                        onChange={(e) => setGenForm({ ...genForm, section_id: e.target.value })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                    Template (optional)
                                </label>
                                <select
                                    value={genForm.template_id}
                                    onChange={(e) => setGenForm({ ...genForm, template_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px' }}
                                >
                                    <option value="">Default template</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.layout_display})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={genForm.generate_pdf}
                                        onChange={(e) => setGenForm({ ...genForm, generate_pdf: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '14px', color: '#374151' }}>Generate PDF files</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={generating}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: generating ? '#9CA3AF' : '#4F46E5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {generating ? 'Generating...' : 'Generate Report Cards'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReportCards
