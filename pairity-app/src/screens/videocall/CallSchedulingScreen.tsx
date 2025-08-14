import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { Calendar, DateData } from 'react-native-calendars';
import moment from 'moment-timezone';

import {
  addScheduledCall,
  updateScheduledCall,
} from '@/store/slices/videoCallSlice';
import { CallSchedule, VirtualDateIdea } from '@/types/videocall';

import TimeSlotPicker from '@/components/videocall/TimeSlotPicker';
import DurationPicker from '@/components/videocall/DurationPicker';
import VirtualDateIdeaPicker from '@/components/videocall/VirtualDateIdeaPicker';
import ReminderSettingsModal from '@/components/videocall/ReminderSettingsModal';

interface CallSchedulingScreenProps {
  route: {
    params: {
      participantId: string;
      participantName: string;
      participantAvatar: string;
      existingSchedule?: CallSchedule;
    };
  };
}

const CallSchedulingScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { scheduledCalls } = useSelector((state: RootState) => state.videoCall);
  
  const params = (route as any).params as CallSchedulingScreenProps['route']['params'];
  const { participantId, participantName, participantAvatar, existingSchedule } = params;

  const [selectedDate, setSelectedDate] = useState<string>(
    existingSchedule?.scheduledTime 
      ? moment(existingSchedule.scheduledTime).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD')
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    existingSchedule?.scheduledTime 
      ? moment(existingSchedule.scheduledTime).format('HH:mm')
      : '20:00'
  );
  const [duration, setDuration] = useState<number>(existingSchedule?.duration || 60);
  const [timezone, setTimezone] = useState<string>(moment.tz.guess());
  const [title, setTitle] = useState<string>(existingSchedule?.title || '');
  const [description, setDescription] = useState<string>(existingSchedule?.description || '');
  const [selectedDateIdea, setSelectedDateIdea] = useState<VirtualDateIdea | undefined>(
    existingSchedule?.virtualDateIdea
  );
  const [reminderSettings, setReminderSettings] = useState({
    enabled: existingSchedule?.reminderSettings.enabled ?? true,
    intervals: existingSchedule?.reminderSettings.intervals ?? [15, 60, 1440], // 15 min, 1 hour, 1 day
    sound: existingSchedule?.reminderSettings.sound ?? true,
    vibration: existingSchedule?.reminderSettings.vibration ?? true,
    notification: existingSchedule?.reminderSettings.notification ?? true,
  });

  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showDateIdeaPicker, setShowDateIdeaPicker] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [busyTimes, setBusyTimes] = useState<string[]>([]);

  useEffect(() => {
    generateAvailableTimeSlots();
  }, [selectedDate]);

  const generateAvailableTimeSlots = () => {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    
    setAvailableTimeSlots(slots);
    
    // Get busy times from existing scheduled calls for selected date
    const busyTimesForDate = scheduledCalls
      .filter(call => 
        moment(call.scheduledTime).format('YYYY-MM-DD') === selectedDate &&
        call.status === 'scheduled'
      )
      .map(call => moment(call.scheduledTime).format('HH:mm'));
    
    setBusyTimes(busyTimesForDate);
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark selected date
    marked[selectedDate] = {
      selected: true,
      selectedColor: theme.colors.primary,
    };

    // Mark dates with existing scheduled calls
    scheduledCalls.forEach(call => {
      const date = moment(call.scheduledTime).format('YYYY-MM-DD');
      if (call.status === 'scheduled') {
        marked[date] = {
          ...marked[date],
          marked: true,
          dotColor: theme.colors.premium,
        };
      }
    });

    return marked;
  };

  const handleDateSelect = (day: DateData) => {
    const selected = day.dateString;
    const today = moment().format('YYYY-MM-DD');
    
    if (selected < today) {
      Alert.alert('Invalid Date', 'Please select a future date for scheduling the call.');
      return;
    }
    
    setSelectedDate(selected);
  };

  const handleScheduleCall = async () => {
    if (!selectedTime) {
      Alert.alert('Time Required', 'Please select a time for the call.');
      return;
    }

    // Create scheduled date/time
    const scheduledDateTime = moment.tz(`${selectedDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm', timezone);
    
    if (scheduledDateTime.isBefore(moment())) {
      Alert.alert('Invalid Time', 'Please select a future time for scheduling the call.');
      return;
    }

    const scheduleData: CallSchedule = {
      id: existingSchedule?.id || `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantId,
      participantName,
      participantAvatar,
      scheduledTime: scheduledDateTime.toDate(),
      duration,
      timezone,
      title: title || `Video call with ${participantName}`,
      description,
      virtualDateIdea: selectedDateIdea,
      reminderSettings,
      status: 'scheduled',
      createdAt: existingSchedule?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      if (existingSchedule) {
        dispatch(updateScheduledCall({ id: existingSchedule.id, updates: scheduleData }));
      } else {
        dispatch(addScheduledCall(scheduleData));
      }

      // TODO: Add to device calendar if enabled
      if (addToCalendar) {
        // await RNCalendarEvents.saveEvent(title, {
        //   startDate: scheduledDateTime.toISOString(),
        //   endDate: scheduledDateTime.add(duration, 'minutes').toISOString(),
        //   description: `Video call with ${participantName}${description ? `\n\n${description}` : ''}`,
        //   location: 'Pairity Video Call',
        // });
      }

      Alert.alert(
        'Call Scheduled',
        `Your video call with ${participantName} has been scheduled for ${scheduledDateTime.format('MMM DD, YYYY [at] HH:mm')}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error scheduling call:', error);
      Alert.alert('Error', 'Failed to schedule the call. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {existingSchedule ? 'Edit Scheduled Call' : 'Schedule Call'}
        </Text>
        <TouchableOpacity onPress={handleScheduleCall} style={styles.saveButton}>
          <Icon name="check" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Participant Info */}
        <View style={[styles.participantSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.participantInfo}>
            <Icon name="person" size={40} color={theme.colors.textSecondary} />
            <View style={styles.participantDetails}>
              <Text style={[styles.participantName, { color: theme.colors.text }]}>
                {participantName}
              </Text>
              <Text style={[styles.participantSubtitle, { color: theme.colors.textSecondary }]}>
                Video Call
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Date
          </Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            minDate={moment().format('YYYY-MM-DD')}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.text,
              dayTextColor: theme.colors.text,
              todayTextColor: theme.colors.primary,
              selectedDayTextColor: 'white',
              monthTextColor: theme.colors.text,
              indicatorColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Time Selection */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Time
          </Text>
          <TouchableOpacity
            style={[styles.timeButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowTimeSlotPicker(true)}
          >
            <Icon name="access-time" size={20} color={theme.colors.text} />
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {selectedTime || 'Select Time'}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.timezoneInfo}>
            <Icon name="public" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.timezoneText, { color: theme.colors.textSecondary }]}>
              {timezone}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Duration
          </Text>
          <TouchableOpacity
            style={[styles.timeButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowDurationPicker(true)}
          >
            <Icon name="timer" size={20} color={theme.colors.text} />
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {duration} minutes
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Virtual Date Ideas */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Virtual Date Ideas
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Make your call more fun with activities
          </Text>
          <TouchableOpacity
            style={[styles.timeButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowDateIdeaPicker(true)}
          >
            <Icon name="lightbulb-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {selectedDateIdea?.title || 'Choose Activity'}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Reminders */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Reminders
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Get notified before the call
              </Text>
            </View>
            <Switch
              value={reminderSettings.enabled}
              onValueChange={(enabled) => 
                setReminderSettings(prev => ({ ...prev, enabled }))
              }
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
              thumbColor={reminderSettings.enabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          
          {reminderSettings.enabled && (
            <TouchableOpacity
              style={[styles.timeButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowReminderSettings(true)}
            >
              <Icon name="notifications" size={20} color={theme.colors.text} />
              <Text style={[styles.timeText, { color: theme.colors.text }]}>
                {reminderSettings.intervals.length} reminder(s) set
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Options */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Add to Calendar
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Save to your device calendar
              </Text>
            </View>
            <Switch
              value={addToCalendar}
              onValueChange={setAddToCalendar}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryLight }}
              thumbColor={addToCalendar ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <TimeSlotPicker
        visible={showTimeSlotPicker}
        availableSlots={availableTimeSlots}
        busySlots={busyTimes}
        selectedSlot={selectedTime}
        onSelectSlot={setSelectedTime}
        onClose={() => setShowTimeSlotPicker(false)}
      />

      <DurationPicker
        visible={showDurationPicker}
        selectedDuration={duration}
        onSelectDuration={setDuration}
        onClose={() => setShowDurationPicker(false)}
      />

      <VirtualDateIdeaPicker
        visible={showDateIdeaPicker}
        selectedIdea={selectedDateIdea}
        onSelectIdea={setSelectedDateIdea}
        onClose={() => setShowDateIdeaPicker(false)}
      />

      <ReminderSettingsModal
        visible={showReminderSettings}
        settings={reminderSettings}
        onUpdateSettings={setReminderSettings}
        onClose={() => setShowReminderSettings(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  participantSection: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  participantSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendar: {
    borderRadius: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
  },
  timezoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  timezoneText: {
    fontSize: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default CallSchedulingScreen;