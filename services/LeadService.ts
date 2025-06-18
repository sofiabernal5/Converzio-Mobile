// services/LeadService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source: 'video' | 'form' | 'calendar' | 'direct';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  lastContactedAt?: string;
  notes: LeadNote[];
  videoId?: string; // if lead came from a video
  customFields: Record<string, string>;
}

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  type: 'note' | 'call' | 'email' | 'meeting';
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source: 'video' | 'form' | 'calendar' | 'direct';
  videoId?: string;
  customFields?: Record<string, string>;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  recentLeads: Lead[];
}

class LeadService {
  private static readonly LEADS_KEY = 'converzio_leads';
  private static readonly LEAD_COUNTER_KEY = 'converzio_lead_counter';

  // Get all leads
  static async getAllLeads(): Promise<Lead[]> {
    try {
      const data = await AsyncStorage.getItem(this.LEADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading leads:', error);
      return [];
    }
  }

  // Get lead by ID
  static async getLeadById(leadId: string): Promise<Lead | null> {
    try {
      const leads = await this.getAllLeads();
      return leads.find(lead => lead.id === leadId) || null;
    } catch (error) {
      console.error('Error loading lead:', error);
      return null;
    }
  }

  // Create new lead
  static async createLead(formData: LeadFormData): Promise<Lead> {
    try {
      const counter = await this.getNextLeadCounter();
      const lead: Lead = {
        id: `lead_${counter}_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        source: formData.source,
        status: 'new',
        priority: 'medium',
        tags: [],
        createdAt: new Date().toISOString(),
        notes: [],
        videoId: formData.videoId,
        customFields: formData.customFields || {},
      };

      // Add initial note if message provided
      if (formData.message) {
        lead.notes.push({
          id: `note_${Date.now()}`,
          text: `Initial message: ${formData.message}`,
          createdAt: new Date().toISOString(),
          type: 'note',
        });
      }

      await this.saveLead(lead);
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Update lead
  static async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead | null> {
    try {
      const leads = await this.getAllLeads();
      const index = leads.findIndex(lead => lead.id === leadId);
      
      if (index === -1) return null;

      leads[index] = { ...leads[index], ...updates };
      await AsyncStorage.setItem(this.LEADS_KEY, JSON.stringify(leads));
      
      return leads[index];
    } catch (error) {
      console.error('Error updating lead:', error);
      return null;
    }
  }

  // Add note to lead
  static async addNoteToLead(leadId: string, noteText: string, type: LeadNote['type'] = 'note'): Promise<boolean> {
    try {
      const lead = await this.getLeadById(leadId);
      if (!lead) return false;

      const note: LeadNote = {
        id: `note_${Date.now()}`,
        text: noteText,
        createdAt: new Date().toISOString(),
        type,
      };

      lead.notes.push(note);
      
      if (type === 'call' || type === 'email' || type === 'meeting') {
        lead.lastContactedAt = new Date().toISOString();
      }

      await this.updateLead(leadId, lead);
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  }

  // Change lead status
  static async changeLeadStatus(leadId: string, status: Lead['status']): Promise<boolean> {
    try {
      const updates: Partial<Lead> = { status };
      
      if (status === 'contacted') {
        updates.lastContactedAt = new Date().toISOString();
      }

      const result = await this.updateLead(leadId, updates);
      return result !== null;
    } catch (error) {
      console.error('Error changing lead status:', error);
      return false;
    }
  }

  // Add tags to lead
  static async addTagsToLead(leadId: string, tags: string[]): Promise<boolean> {
    try {
      const lead = await this.getLeadById(leadId);
      if (!lead) return false;

      const existingTags = new Set(lead.tags);
      tags.forEach(tag => existingTags.add(tag.toLowerCase()));
      
      await this.updateLead(leadId, { tags: Array.from(existingTags) });
      return true;
    } catch (error) {
      console.error('Error adding tags:', error);
      return false;
    }
  }

  // Filter leads
  static async filterLeads(filters: {
    status?: Lead['status'];
    priority?: Lead['priority'];
    source?: Lead['source'];
    tags?: string[];
    search?: string;
  }): Promise<Lead[]> {
    try {
      let leads = await this.getAllLeads();

      if (filters.status) {
        leads = leads.filter(lead => lead.status === filters.status);
      }

      if (filters.priority) {
        leads = leads.filter(lead => lead.priority === filters.priority);
      }

      if (filters.source) {
        leads = leads.filter(lead => lead.source === filters.source);
      }

      if (filters.tags && filters.tags.length > 0) {
        leads = leads.filter(lead => 
          filters.tags!.some(tag => lead.tags.includes(tag.toLowerCase()))
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        leads = leads.filter(lead => 
          lead.name.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          (lead.company && lead.company.toLowerCase().includes(searchTerm)) ||
          (lead.message && lead.message.toLowerCase().includes(searchTerm))
        );
      }

      return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error filtering leads:', error);
      return [];
    }
  }

  // Get lead statistics
  static async getLeadStats(): Promise<LeadStats> {
    try {
      const leads = await this.getAllLeads();
      const totalLeads = leads.length;
      
      const newLeads = leads.filter(lead => lead.status === 'new').length;
      const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
      
      const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

      const leadsBySource = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const leadsByStatus = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentLeads = leads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate,
        leadsBySource,
        leadsByStatus,
        recentLeads,
      };
    } catch (error) {
      console.error('Error getting lead stats:', error);
      return {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        leadsBySource: {},
        leadsByStatus: {},
        recentLeads: [],
      };
    }
  }

  // Delete lead
  static async deleteLead(leadId: string): Promise<boolean> {
    try {
      const leads = await this.getAllLeads();
      const filteredLeads = leads.filter(lead => lead.id !== leadId);
      await AsyncStorage.setItem(this.LEADS_KEY, JSON.stringify(filteredLeads));
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  // Export leads
  static async exportLeads(): Promise<string> {
    try {
      const leads = await this.getAllLeads();
      const stats = await this.getLeadStats();
      
      return JSON.stringify({
        leads,
        stats,
        exportedAt: new Date().toISOString(),
        totalCount: leads.length,
      }, null, 2);
    } catch (error) {
      console.error('Error exporting leads:', error);
      return '';
    }
  }

  // Helper methods
  private static async saveLead(lead: Lead): Promise<void> {
    try {
      const leads = await this.getAllLeads();
      const existingIndex = leads.findIndex(l => l.id === lead.id);
      
      if (existingIndex >= 0) {
        leads[existingIndex] = lead;
      } else {
        leads.push(lead);
      }

      await AsyncStorage.setItem(this.LEADS_KEY, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving lead:', error);
      throw error;
    }
  }

  private static async getNextLeadCounter(): Promise<number> {
    try {
      const counter = await AsyncStorage.getItem(this.LEAD_COUNTER_KEY);
      const nextCounter = counter ? parseInt(counter) + 1 : 1;
      await AsyncStorage.setItem(this.LEAD_COUNTER_KEY, nextCounter.toString());
      return nextCounter;
    } catch (error) {
      console.error('Error getting lead counter:', error);
      return Date.now();
    }
  }

  // Quick lead capture (for videos)
  static async captureVideoLead(videoId: string, name: string, email: string, message?: string): Promise<Lead> {
    return this.createLead({
      name,
      email,
      message,
      source: 'video',
      videoId,
    });
  }

  // Bulk operations
  static async bulkUpdateLeadStatus(leadIds: string[], status: Lead['status']): Promise<number> {
    try {
      let updatedCount = 0;
      for (const leadId of leadIds) {
        const success = await this.changeLeadStatus(leadId, status);
        if (success) updatedCount++;
      }
      return updatedCount;
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      return 0;
    }
  }
}

export default LeadService;