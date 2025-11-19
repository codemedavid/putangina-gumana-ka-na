import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { COAReport } from '../types';

export function useCOA() {
  const [reports, setReports] = useState<COAReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('coa_reports_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'coa_reports' },
        () => {
          console.log('COA reports changed, refetching...');
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchReports = async (activeOnly: boolean = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('coa_reports')
        .select('*')
        .order('featured', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setReports(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch COA reports');
      console.error('Error fetching COA reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (report: Omit<COAReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('coa_reports')
        .insert([report])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        setReports([...reports, data]);
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error adding COA report:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add COA report' };
    }
  };

  const updateReport = async (id: string, updates: Partial<COAReport>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('coa_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setReports(reports.map(r => r.id === id ? data : r));
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error updating COA report:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update COA report' };
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('coa_reports')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setReports(reports.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting COA report:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete COA report' };
    }
  };

  return {
    reports,
    loading,
    error,
    fetchReports,
    addReport,
    updateReport,
    deleteReport
  };
}

