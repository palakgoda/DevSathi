'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
    Sparkles,
    BookOpen,
    FileText,
    FolderOpen,
    Trash2,
    ExternalLink,
    UploadCloud
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DocumentItem = {
    notebookId: string;
    notebookName: string;
    fileName: string;
    fileExtension: string;
    fileType: string;
};

export default function SubjectsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        fullName: 'Student',
        initials: 'ST',
    });
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjectsData();
    }, [router]);

    async function loadSubjectsData() {
        // 1. Check Auth Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // 2. Fetch User Profile
        const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (userData) {
            const nameParts = userData.full_name?.trim().split(' ') || [];
            const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
            setProfile({ fullName: userData.full_name, initials });
        }

        // 3. Fetch all notebooks for this user
        const { data: notebooksData, error } = await supabase
            .from('notebooks')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error("Supabase Error [subjects notebooks]:", error.message);
        }

        if (notebooksData && !error) {
            const docs: DocumentItem[] = [];
            notebooksData.forEach((nb) => {
                let contentObj: any = {};
                try {
                    contentObj = typeof nb.content === 'string' ? JSON.parse(nb.content) : (nb.content || {});
                } catch (e) {}

                const files = contentObj.files || [];
                files.forEach((f: any) => {
                    const ext = f.name.split('.').pop() || f.language || 'unknown';
                    docs.push({
                        notebookId: nb.id,
                        notebookName: nb.title || nb.subject || 'Untitled Notebook',
                        fileName: f.name,
                        fileExtension: ext,
                        fileType: f.type
                    });
                });
            });
            setDocuments(docs);
        }
        setLoading(false);
    }

    const handleDelete = async (doc: DocumentItem) => {
        if (!confirm(`Are you sure you want to delete ${doc.fileName}?`)) return;

        const { data: nbData, error: nbError } = await supabase
            .from('notebooks')
            .select('*')
            .eq('id', doc.notebookId)
            .single();

        if (nbData && !nbError) {
            let contentObj: any = {};
            try {
                contentObj = typeof nbData.content === 'string' ? JSON.parse(nbData.content) : (nbData.content || {});
            } catch (e) {}

            const currentFiles = contentObj.files || [];
            const updatedFiles = currentFiles.filter((f: any) => f.name !== doc.fileName);
            contentObj.files = updatedFiles;

            await supabase
                .from('notebooks')
                .update({ content: JSON.stringify(contentObj), updated_at: new Date().toISOString() })
                .eq('id', doc.notebookId);

            loadSubjectsData();
        }
    };

    const handleUploadClick = () => {
        // We simulate straight to platform by creating an 'Unassigned' notebook on the fly or prompt.
        // Let's redirect to studio with a flag to open upload, or just redirect to studio.
        router.push('/studio?subject=Unassigned&topic=Uploaded Documents');
    };

    return (
        <DashboardLayout>
                <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Subjects & Documents</h2>
                            <p className="text-on-surface-variant mt-1">Manage all your uploaded resources, notes, and references.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleUploadClick}
                                className="bg-secondary text-on-secondary hover:bg-secondary/90 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>Upload Document</span>
                            </button>
                            <Link
                                href="/studio"
                                className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Create Notebook</span>
                            </Link>
                        </div>
                    </div>

                    {/* Documents Table */}
                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading documents...</div>
                    ) : documents.length > 0 ? (
                        <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm bg-white/50">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low text-on-surface-variant text-sm font-semibold border-b border-outline-variant/30">
                                    <tr>
                                        <th className="p-4">Document Name</th>
                                        <th className="p-4">Extension</th>
                                        <th className="p-4">Notebook</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc, idx) => (
                                        <tr key={`${doc.notebookId}-${idx}`} className="border-b border-outline-variant/20 hover:bg-surface/50 transition-colors">
                                            <td className="p-4 flex items-center gap-3 text-sm font-medium text-on-surface">
                                                <FileText className="w-4 h-4 text-secondary" />
                                                {doc.fileName}
                                            </td>
                                            <td className="p-4 text-sm text-on-surface-variant">
                                                <span className="bg-surface-container px-2 py-1 rounded font-mono text-xs uppercase">
                                                    {doc.fileExtension}
                                                </span>
                                            </td>
                                            <td className="p-4 flex items-center gap-2 text-sm text-on-surface-variant">
                                                <FolderOpen className="w-4 h-4" />
                                                {doc.notebookName}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDelete(doc)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete Document"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/studio?notebookId=${doc.notebookId}`}
                                                        className="p-2 text-primary hover:bg-primary-container rounded transition-colors"
                                                        title="Open in Studio"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24 glass-panel rounded-2xl p-12">
                            <BookOpen className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-on-surface">No documents found</h3>
                            <p className="text-sm text-on-surface-variant mb-6">Upload a document or create a notebook to get started.</p>
                            <button
                                onClick={handleUploadClick}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm shadow-md"
                            >
                                <UploadCloud className="w-4 h-4" /> Upload Document
                            </button>
                        </div>
                    )}

                </div>
            
        </DashboardLayout>
    );
}