// app/leads.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LeadService, { Lead, LeadStats } from '../services/LeadService';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'new' | 'contacted' | 'qualified' | 'converted';

export default function LeadsScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [activeFilter, searchQuery]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      
      if (activeFilter !== 'all') {
        filters.status = activeFilter;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const filteredLeads = await LeadService.filterLeads(filters);
      setLeads(filteredLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const leadStats = await LeadService.getLeadStats();
      setStats(leadStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await LeadService.changeLeadStatus(leadId, newStatus);
      loadLeads();
      loadStats();
      
      if (selectedLead?.id === leadId) {
        const updatedLead = await LeadService.getLeadById(leadId);
        setSelectedLead(updatedLead);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      await LeadService.addNoteToLead(selectedLead.id, newNote.trim(), 'note');
      const updatedLead = await LeadService.getLeadById(selectedLead.id);
      setSelectedLead(updatedLead);
      setNewNote('');
      setShowAddNote(false);
      loadLeads();
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LeadService.deleteLead(leadId);
              loadLeads();
              loadStats();
              if (selectedLead?.id === leadId) {
                setShowLeadDetail(false);
                setSelectedLead(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lead');
            }
          }
        }
      ]
    );
  };

  const exportLeads = async () => {
    try {
      const exportData = await LeadService.exportLeads();
      Alert.alert(
        'Export Success',
        'Leads data exported successfully!\n\nIn a real app, this would be saved to a file or shared.',
        [{ text: 'OK' }]
      );
      console.log('Exported Leads Data:', exportData);
    } catch (error) {
      Alert.alert('Error', 'Failed to export leads data');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '#28a745';
      case 'contacted': return '#4a90e2';
      case 'qualified': return '#ffc107';
      case 'converted': return '#28a745';
      case 'lost': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>Lead Overview</Text>
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.newLeads}</Text>
              <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.qualifiedLeads}</Text>
              <Text style={styles.statLabel}>Qualified</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'new', 'contacted', 'qualified', 'converted'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilter === filter && styles.filterButtonTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLeadCard = (lead: Lead) => (
    <TouchableOpacity
      key={lead.id}
      style={styles.leadCard}
      onPress={() => {
        setSelectedLead(lead);
        setShowLeadDetail(true);
      }}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.leadEmail}>{lead.email}</Text>
          {lead.company && (
            <Text style={styles.leadCompany}>{lead.company}</Text>
          )}
        </View>
        <View style={styles.leadMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
            <Text style={styles.statusText}>{lead.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(lead.priority) }]}>
            <Text style={styles.priorityText}>{lead.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.leadDetails}>
        <Text style={styles.leadSource}>Source: {lead.source}</Text>
        <Text style={styles.leadDate}>Created: {formatDate(lead.createdAt)}</Text>
        {lead.lastContactedAt && (
          <Text style={styles.leadContact}>Last contacted: {formatDate(lead.lastContactedAt)}</Text>
        )}
      </View>

      {lead.message && (
        <View style={styles.leadMessage}>
          <Text style={styles.leadMessageText} numberOfLines={2}>
            "{lead.message}"
          </Text>
        </View>
      )}

      {lead.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {lead.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {lead.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{lead.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderLeadDetail = () => (
    <Modal
      visible={showLeadDetail}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLeadDetail(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {selectedLead && (
          <>
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity onPress={() => setShowLeadDetail(false)}>
                  <Text style={styles.modalBackText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Lead Details</Text>
                <TouchableOpacity onPress={() => handleDeleteLead(selectedLead.id)}>
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              {/* Lead Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Contact Information</Text>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedLead.name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedLead.email}</Text>
                </View>
                {selectedLead.phone && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedLead.phone}</Text>
                  </View>
                )}
                {selectedLead.company && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Company:</Text>
                    <Text style={styles.detailValue}>{selectedLead.company}</Text>
                  </View>
                )}
              </View>

              {/* Status & Priority */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Status & Priority</Text>
                <View style={styles.statusPriorityContainer}>
                  <View style={styles.statusSelector}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {(['new', 'contacted', 'qualified', 'converted', 'lost'] as Lead['status'][]).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            selectedLead.status === status && styles.statusOptionActive,
                            { backgroundColor: getStatusColor(status) }
                          ]}
                          onPress={() => handleStatusChange(selectedLead.id, status)}
                        >
                          <Text style={styles.statusOptionText}>{status.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              {/* Initial Message */}
              {selectedLead.message && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Initial Message</Text>
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{selectedLead.message}</Text>
                  </View>
                </View>
              )}

              {/* Notes */}
              <View style={styles.detailSection}>
                <View style={styles.notesHeader}>
                  <Text style={styles.detailSectionTitle}>Notes ({selectedLead.notes.length})</Text>
                  <TouchableOpacity
                    style={styles.addNoteButton}
                    onPress={() => setShowAddNote(true)}
                  >
                    <Text style={styles.addNoteButtonText}>+ Add Note</Text>
                  </TouchableOpacity>
                </View>
                
                {selectedLead.notes.length === 0 ? (
                  <Text style={styles.noNotesText}>No notes yet</Text>
                ) : (
                  <View style={styles.notesList}>
                    {selectedLead.notes.reverse().map((note) => (
                      <View key={note.id} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <Text style={styles.noteType}>{note.type.toUpperCase()}</Text>
                          <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                        </View>
                        <Text style={styles.noteText}>{note.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderAddNoteModal = () => (
    <Modal
      visible={showAddNote}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={() => setShowAddNote(false)}
    >
      <SafeAreaView style={styles.noteModalContainer}>
        <View style={styles.noteModalHeader}>
          <TouchableOpacity onPress={() => setShowAddNote(false)}>
            <Text style={styles.noteModalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.noteModalTitle}>Add Note</Text>
          <TouchableOpacity onPress={handleAddNote}>
            <Text style={styles.noteModalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.noteModalContent}>
          <TextInput
            style={styles.noteInput}
            placeholder="Enter your note..."
            value={newNote}
            onChangeText={setNewNote}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leads</Text>
          <TouchableOpacity onPress={exportLeads}>
            <Text style={styles.exportButton}>Export</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatsCard()}
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {renderFilterButtons()}

        {/* Leads List */}
        <View style={styles.leadsContainer}>
          <Text style={styles.leadsTitle}>
            {activeFilter === 'all' ? 'All Leads' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Leads`} ({leads.length})
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leads...</Text>
            </View>
          ) : leads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Leads Found</Text>
              <Text style={styles.emptyStateDescription}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Start capturing leads from your videos and forms'}
              </Text>
            </View>
          ) : (
            <View style={styles.leadsList}>
              {leads.map(renderLeadCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {renderLeadDetail()}
      {renderAddNoteModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsGradient: {
    padding: 20,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  leadsContainer: {
    marginBottom: 20,
  },
  leadsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  leadsList: {
    gap: 12,
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  leadEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  leadCompany: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
  },
  leadMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  leadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leadSource: {
    fontSize: 12,
    color: '#6c757d',
  },
  leadDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  leadContact: {
    fontSize: 12,
    color: '#28a745',
  },
  leadMessage: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  leadMessageText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusPriorityContainer: {
    gap: 16,
  },
  statusSelector: {
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusOptionActive: {
    opacity: 1,
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNoteButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addNoteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noNotesText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  noteDate: {
    fontSize: 10,
    color: '#6c757d',
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  // Add Note Modal
  noteModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  noteModalCancel: {
    fontSize: 16,
    color: '#6c757d',
  },
  noteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noteModalSave: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  noteModalContent: {
    flex: 1,
    padding: 20,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 150,
    textAlignVertical: 'top',
  },
});