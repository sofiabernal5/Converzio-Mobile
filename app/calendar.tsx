// app/calendar.tsx (Updated with new color scheme)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

type ViewMode = 'month' | 'week' | 'day';

const STORAGE_KEY = 'converzio_calendar_events';

export default function CalendarScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaDate, setAgendaDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    startAmPm: 'AM' as 'AM' | 'PM',
    endAmPm: 'AM' as 'AM' | 'PM',
    color: '#00b5d9',
  });

  const eventColors = [
    '#00b5d9', '#4699b3', '#1c3f5b', '#6dd3f0', '#28a745', '#dc3545', '#ffc107'
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const saveEvents = async (updatedEvents: CalendarEvent[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const openDayAgenda = (date: Date) => {
    setAgendaDate(date);
    setShowAgenda(true);
  };

  const openAddEventModal = (date: Date) => {
    setSelectedDate(date);
    setShowAddEventModal(true);
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    // Convert 12-hour format to 24-hour format for storage
    const convertTo24Hour = (time: string, ampm: 'AM' | 'PM') => {
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate.toISOString().split('T')[0],
      startTime: convertTo24Hour(newEvent.startTime, newEvent.startAmPm),
      endTime: convertTo24Hour(newEvent.endTime, newEvent.endAmPm),
      color: newEvent.color,
    };

    const updatedEvents = [...events, event];
    saveEvents(updatedEvents);
    
    setShowAddEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      startAmPm: 'AM',
      endAmPm: 'AM',
      color: '#00b5d9',
    });
  };

  const deleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEvents = events.filter(event => event.id !== eventId);
            saveEvents(updatedEvents);
          }
        }
      ]
    );
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Fill remaining cells to complete the grid (6 rows of 7 days = 42 cells)
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    while (days.length < totalCells) {
      days.push(null);
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDuration = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.monthContainer}>
        {/* Week day headers */}
        <View style={styles.weekDaysHeader}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayHeader}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const row = Math.floor(index / 7);
            const col = index % 7;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isToday(day) && styles.todayCell,
                  day && isSameDate(day, selectedDate) && styles.selectedDayCell
                ]}
                onPress={() => {
                  if (day) {
                    openDayAgenda(day);
                  }
                }}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.dayNumber,
                      isToday(day) && styles.todayText,
                      isSameDate(day, selectedDate) && styles.selectedDayText
                    ]}>
                      {day.getDate()}
                    </Text>
                    <View style={styles.dayEvents}>
                      {getEventsForDate(day).slice(0, 3).map((event, eventIndex) => (
                        <View
                          key={event.id}
                          style={[styles.eventDot, { backgroundColor: event.color }]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <ScrollView style={styles.weekContainer} showsVerticalScrollIndicator={false}>
        {/* Week header */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.weekDayColumn,
                isToday(day) && styles.todayColumn
              ]}
              onPress={() => openDayAgenda(day)}
            >
              <Text style={[
                styles.weekDayName,
                isToday(day) && styles.todayText
              ]}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[
                styles.weekDayNumber,
                isToday(day) && styles.todayText
              ]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Week timeline */}
        <View style={styles.weekTimeline}>
          {hours.map((hour) => (
            <View key={hour} style={styles.hourRow}>
              <View style={styles.hourLabel}>
                <Text style={styles.hourText}>
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </Text>
              </View>
              <View style={styles.hourEvents}>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDate(day).filter(event => {
                    const eventHour = parseInt(event.startTime.split(':')[0]);
                    return eventHour === hour;
                  });
                  
                  return (
                    <View key={day.toISOString()} style={styles.hourEventCell}>
                      {dayEvents.map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          style={[styles.weekEvent, { backgroundColor: event.color }]}
                          onPress={() => deleteEvent(event.id)}
                        >
                          <Text style={styles.weekEventText} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text style={styles.weekEventTime} numberOfLines={1}>
                            {formatTime(event.startTime)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <ScrollView style={styles.dayContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.dayHeader}>
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={() => openAddEventModal(currentDate)}
          >
            <LinearGradient
              colors={['#00b5d9', '#4699b3']}
              style={styles.addEventButtonGradient}
            >
              <Text style={styles.addEventButtonText}>+ Add Event</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.dayTimeline}>
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseInt(event.startTime.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <View key={hour} style={styles.dayHourRow}>
                <View style={styles.dayHourLabel}>
                  <Text style={styles.hourText}>
                    {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </Text>
                </View>
                <View style={styles.dayHourEvents}>
                  {hourEvents.map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.dayEvent, { backgroundColor: event.color }]}
                      onPress={() => deleteEvent(event.id)}
                    >
                      <Text style={styles.dayEventTitle}>{event.title}</Text>
                      <Text style={styles.dayEventTime}>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </Text>
                      {event.description && (
                        <Text style={styles.dayEventDescription} numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderAgendaModal = () => {
    if (!agendaDate) return null;
    
    const dayEvents = getEventsForDate(agendaDate);
    const sortedEvents = dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <Modal
        visible={showAgenda}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAgenda(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <AnimatedBackground />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity onPress={() => setShowAgenda(false)}>
                  <Text style={styles.modalCancelText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Day Agenda</Text>
                <TouchableOpacity onPress={() => openAddEventModal(agendaDate)}>
                  <Text style={styles.modalSaveText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              
              {/* Week view navigation for agenda */}
              {viewMode === 'week' && agendaDate && (
                <View style={styles.agendaWeekHeader}>
                  {getWeekDays(agendaDate).map((day) => (
                    <TouchableOpacity
                      key={day.toISOString()}
                      style={[
                        styles.agendaWeekDay,
                        isSameDate(day, agendaDate) && styles.selectedAgendaDay,
                        isToday(day) && styles.todayAgendaDay
                      ]}
                      onPress={() => setAgendaDate(day)}
                    >
                      <Text style={[
                        styles.agendaWeekDayName,
                        isSameDate(day, agendaDate) && styles.selectedAgendaDayText,
                        isToday(day) && styles.todayAgendaDayText
                      ]}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={[
                        styles.agendaWeekDayNumber,
                        isSameDate(day, agendaDate) && styles.selectedAgendaDayText,
                        isToday(day) && styles.todayAgendaDayText
                      ]}>
                        {day.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <View style={styles.agendaDateInfo}>
                <Text style={styles.agendaDateText}>
                  {agendaDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={styles.agendaEventCount}>
                  {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.agendaContent} showsVerticalScrollIndicator={false}>
            {sortedEvents.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsTitle}>No Events Scheduled</Text>
                <Text style={styles.noEventsSubtitle}>
                  Tap the + Add button to create your first event for this day
                </Text>
                <TouchableOpacity
                  style={styles.addFirstEventButton}
                  onPress={() => {
                    setShowAgenda(false);
                    openAddEventModal(agendaDate);
                  }}
                >
                  <LinearGradient
                    colors={['#00b5d9', '#4699b3']}
                    style={styles.addFirstEventButtonGradient}
                  >
                    <Text style={styles.addFirstEventButtonText}>Add First Event</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {sortedEvents.map((event, index) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.agendaEventCard, { borderLeftColor: event.color }]}
                    onPress={() => deleteEvent(event.id)}
                  >
                    <View style={styles.agendaEventTime}>
                      <Text style={styles.agendaEventStartTime}>
                        {formatTime(event.startTime)}
                      </Text>
                      <Text style={styles.agendaEventEndTime}>
                        {formatTime(event.endTime)}
                      </Text>
                    </View>
                    <View style={styles.agendaEventDetails}>
                      <Text style={styles.agendaEventTitle}>{event.title}</Text>
                      {event.description && (
                        <Text style={styles.agendaEventDescription}>
                          {event.description}
                        </Text>
                      )}
                      <View style={styles.agendaEventMeta}>
                        <View style={[styles.agendaEventColorDot, { backgroundColor: event.color }]} />
                        <Text style={styles.agendaEventDuration}>
                          {getDuration(event.startTime, event.endTime)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.agendaEventActions}>
                      <Text style={styles.agendaEventDeleteHint}>Tap to delete</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderAddEventModal = () => (
    <Modal
      visible={showAddEventModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddEventModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeaderContainer}>
          <AnimatedBackground />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowAddEventModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TouchableOpacity onPress={addEvent}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title *</Text>
            <TextInput
              style={styles.textInput}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
              placeholder="Enter event title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newEvent.description}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
              placeholder="Enter event description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={newEvent.startTime}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, startTime: text }))}
                  placeholder="09:00"
                  placeholderTextColor="#999"
                />
                <View style={styles.amPmSelector}>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      newEvent.startAmPm === 'AM' && styles.selectedAmPm
                    ]}
                    onPress={() => setNewEvent(prev => ({ ...prev, startAmPm: 'AM' }))}
                  >
                    <Text style={[
                      styles.amPmText,
                      newEvent.startAmPm === 'AM' && styles.selectedAmPmText
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      newEvent.startAmPm === 'PM' && styles.selectedAmPm
                    ]}
                    onPress={() => setNewEvent(prev => ({ ...prev, startAmPm: 'PM' }))}
                  >
                    <Text style={[
                      styles.amPmText,
                      newEvent.startAmPm === 'PM' && styles.selectedAmPmText
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.timeGroup}>
              <Text style={styles.inputLabel}>End Time</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={newEvent.endTime}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, endTime: text }))}
                  placeholder="10:00"
                  placeholderTextColor="#999"
                />
                <View style={styles.amPmSelector}>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      newEvent.endAmPm === 'AM' && styles.selectedAmPm
                    ]}
                    onPress={() => setNewEvent(prev => ({ ...prev, endAmPm: 'AM' }))}
                  >
                    <Text style={[
                      styles.amPmText,
                      newEvent.endAmPm === 'AM' && styles.selectedAmPmText
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      newEvent.endAmPm === 'PM' && styles.selectedAmPm
                    ]}
                    onPress={() => setNewEvent(prev => ({ ...prev, endAmPm: 'PM' }))}
                  >
                    <Text style={[
                      styles.amPmText,
                      newEvent.endAmPm === 'PM' && styles.selectedAmPmText
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Color</Text>
            <View style={styles.colorPicker}>
              {eventColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newEvent.color === color && styles.selectedColor
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, color }))}
                />
              ))}
            </View>
          </View>

          {selectedDate && (
            <View style={styles.dateInfo}>
              <Text style={styles.dateInfoText}>
                Date: {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Header with AnimatedBackground */}
        <View style={styles.headerContainer}>
          <AnimatedBackground />
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Calendar</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.headerControls}>
              <TouchableOpacity onPress={() => navigateDate('prev')}>
                <Text style={styles.navButton}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.currentDateText}>
                {viewMode === 'month' && getMonthName(currentDate)}
                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity onPress={() => navigateDate('next')}>
                <Text style={styles.navButton}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewModeSelector}>
              {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.viewModeButton,
                    viewMode === mode && styles.activeViewMode
                  ]}
                  onPress={() => setViewMode(mode)}
                >
                  <Text style={[
                    styles.viewModeText,
                    viewMode === mode && styles.activeViewModeText
                  ]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Calendar Content */}
        <View style={styles.calendarContent}>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </View>
      </View>

      {renderAddEventModal()}
      {renderAgendaModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSpacer: {
    width: 50,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currentDateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewModeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeViewModeText: {
    color: '#fff',
    fontWeight: '600',
  },
  calendarContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Month View Styles
  monthContainer: {
    flex: 1,
    padding: 16,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  weekDayHeader: {
    width: `${100/7}%`,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    minHeight: 70,
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#00b5d9',
  },
  selectedDayCell: {
    backgroundColor: '#00b5d9',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  todayText: {
    color: '#00b5d9',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayEvents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Week View Styles
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  todayColumn: {
    backgroundColor: '#e3f2fd',
  },
  weekDayName: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  weekDayNumber: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  weekTimeline: {
    flexDirection: 'column',
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  hourLabel: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  hourText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  hourEvents: {
    flex: 1,
    flexDirection: 'row',
  },
  hourEventCell: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#f1f3f4',
  },
  weekEvent: {
    borderRadius: 4,
    padding: 4,
    marginVertical: 1,
  },
  weekEventText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  weekEventTime: {
    color: '#fff',
    fontSize: 9,
    opacity: 0.9,
  },
  // Day View Styles
  dayContainer: {
    flex: 1,
  },
  dayHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  addEventButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addEventButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dayTimeline: {
    flexDirection: 'column',
  },
  dayHourRow: {
    flexDirection: 'row',
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  dayHourLabel: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    backgroundColor: '#f8f9fa',
  },
  dayHourEvents: {
    flex: 1,
    padding: 8,
  },
  dayEvent: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dayEventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayEventTime: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 4,
  },
  dayEventDescription: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeaderContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeGroup: {
    flex: 1,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  amPmSelector: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  selectedAmPm: {
    backgroundColor: '#00b5d9',
  },
  amPmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedAmPmText: {
    color: '#fff',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
  },
  dateInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  dateInfoText: {
    color: '#00b5d9',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Agenda Modal Styles
  agendaWeekHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
    marginHorizontal: 20,
  },
  agendaWeekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectedAgendaDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  todayAgendaDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  agendaWeekDayName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  agendaWeekDayNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedAgendaDayText: {
    color: '#ffffff',
  },
  todayAgendaDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  agendaDateInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  agendaDateText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  agendaEventCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  agendaContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  noEventsContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  noEventsSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addFirstEventButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addFirstEventButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addFirstEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventsList: {
    padding: 20,
    gap: 12,
  },
  agendaEventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  agendaEventTime: {
    alignItems: 'flex-end',
    marginRight: 16,
    minWidth: 70,
  },
  agendaEventStartTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  agendaEventEndTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  agendaEventDetails: {
    flex: 1,
  },
  agendaEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  agendaEventDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  agendaEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaEventColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  agendaEventDuration: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  agendaEventActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  agendaEventDeleteHint: {
    fontSize: 10,
    color: '#dc3545',
    fontStyle: 'italic',
  },
});