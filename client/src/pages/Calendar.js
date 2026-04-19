import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  AcademicCapIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { eventService } from '../services/eventService';
import { useToast } from '../context/ToastContext';

const Calendar = () => {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getAllEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // Next month padding
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;

    const dayEvents = getEventsForDate(day.fullDate);
    setSelectedDate(day.fullDate);
    setSelectedEvents(dayEvents);
    if (dayEvents.length > 0) {
      setIsEventModalOpen(true);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventColor = (type) => {
    const colors = {
      academic: 'bg-blue-500',
      exam: 'bg-red-500',
      holiday: 'bg-green-500',
      sports: 'bg-yellow-500',
      cultural: 'bg-purple-500',
      meeting: 'bg-indigo-500',
      workshop: 'bg-pink-500',
      celebration: 'bg-orange-500',
      competition: 'bg-teal-500',
      other: 'bg-gray-500',
    };
    return colors[type] || colors.other;
  };

  const getEventIcon = (type) => {
    const icons = {
      academic: AcademicCapIcon,
      exam: CalendarIcon,
      sports: TrophyIcon,
      meeting: UserGroupIcon,
    };
    return icons[type] || CalendarIcon;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📅 Academic Calendar</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View events, exams, and important dates
            </p>
          </div>
          <Button onClick={handleToday} icon={CalendarIcon}>
            Today
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                {events.filter(e => {
                  const eDate = new Date(e.date);
                  return eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
                }).length} events this month
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-dark-800 shadow-xl rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-100 dark:bg-dark-700 border-b-2 border-gray-200 dark:border-dark-600">
            {dayNames.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-y dark:divide-dark-600">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.fullDate);
              const isTodayDate = isToday(day.fullDate);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[100px] p-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-dark-700 ${!day.isCurrentMonth
                    ? 'bg-gray-50 dark:bg-dark-750 opacity-50'
                    : isTodayDate
                      ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 ring-inset'
                      : 'bg-white dark:bg-dark-800'
                    }`}
                >
                  <div className="flex flex-col h-full">
                    {/* Date Number */}
                    <div className={`text-sm font-semibold mb-2 ${isTodayDate
                      ? 'bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center'
                      : day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                      }`}>
                      {day.date}
                    </div>

                    {/* Events */}
                    <div className="space-y-1 flex-1 overflow-y-auto">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${getEventColor(event.eventType)} bg-opacity-20 border-l-2 ${getEventColor(event.eventType).replace('bg-', 'border-')} truncate hover:shadow-md transition-shadow`}
                          title={event.title}
                        >
                          <span className="font-medium">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Legend */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: 'academic', label: 'Academic', icon: AcademicCapIcon },
              { type: 'exam', label: 'Exam', icon: CalendarIcon },
              { type: 'holiday', label: 'Holiday', icon: CalendarIcon },
              { type: 'sports', label: 'Sports', icon: TrophyIcon },
              { type: 'cultural', label: 'Cultural', icon: UserGroupIcon },
              { type: 'meeting', label: 'Meeting', icon: UserGroupIcon },
              { type: 'workshop', label: 'Workshop', icon: AcademicCapIcon },
              { type: 'celebration', label: 'Celebration', icon: CalendarIcon },
              { type: 'competition', label: 'Competition', icon: TrophyIcon },
              { type: 'other', label: 'Other', icon: CalendarIcon },
            ].map(({ type, label, icon: Icon }) => (
              <div key={type} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${getEventColor(type)}`}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Modal */}
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title={selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Events'}
          size="large"
        >
          {selectedEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedEvents.map((event, idx) => {
                const Icon = getEventIcon(event.eventType);
                return (
                  <div
                    key={idx}
                    className={`border-l-4 ${getEventColor(event.eventType).replace('bg-', 'border-')} bg-gray-50 dark:bg-dark-700 p-4 rounded-r-lg hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getEventColor(event.eventType)} bg-opacity-20`}>
                        <Icon className={`h-6 w-6 ${getEventColor(event.eventType).replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          {event.startTime && (
                            <span className="flex items-center">
                              ⏰ {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center">
                              📍 {event.location}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full ${getEventColor(event.eventType)} bg-opacity-20 text-xs font-medium capitalize`}>
                            {event.eventType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for this date
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Calendar;
