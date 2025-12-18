import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const initialState = {
  events: [],
  dateEvents: [],
  summary: {},
  selectedDate: new Date().toISOString().split('T')[0],
  currentView: 'month',
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Async thunks
export const getCalendarEvents = createAsyncThunk(
  'calendar/getCalendarEvents',
  async ({ year, month }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/calendar/events`, {
        params: { year, month }
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const getDateEvents = createAsyncThunk(
  'calendar/getDateEvents',
  async (date, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/calendar/events/date/${date}`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const getCalendarSummary = createAsyncThunk(
  'calendar/getCalendarSummary',
  async ({ year, month }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/calendar/summary`, {
        params: { year, month }
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const createCalendarEvent = createAsyncThunk(
  'calendar/createCalendarEvent',
  async (eventData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/calendar/events`, eventData);
      
      // Auto-refresh events after creation
      setTimeout(() => {
        thunkAPI.dispatch(getCalendarEvents({
          year: new Date(eventData.date).getFullYear(),
          month: new Date(eventData.date).getMonth() + 1
        }));
      }, 500);
      
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const updateCalendarEvent = createAsyncThunk(
  'calendar/updateCalendarEvent',
  async ({ id, eventData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/calendar/events/${id}`, eventData);
      
      // Auto-refresh events after update
      setTimeout(() => {
        thunkAPI.dispatch(getCalendarEvents({
          year: new Date(eventData.date).getFullYear(),
          month: new Date(eventData.date).getMonth() + 1
        }));
      }, 500);
      
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const deleteCalendarEvent = createAsyncThunk(
  'calendar/deleteCalendarEvent',
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(`${API_URL}/calendar/events/${id}`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const toggleEventCompletion = createAsyncThunk(
  'calendar/toggleEventCompletion',
  async (id, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_URL}/calendar/events/${id}/toggle`);
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue('Network error occurred');
    }
  }
);

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    resetCalendar: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    updateEventInState: (state, action) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      
      const dateIndex = state.dateEvents.findIndex(e => e.id === action.payload.id);
      if (dateIndex !== -1) {
        state.dateEvents[dateIndex] = action.payload;
      }
    },
    clearDateEvents: (state) => {
      state.dateEvents = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Calendar Events
      .addCase(getCalendarEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCalendarEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = action.payload.data || action.payload;
      })
      .addCase(getCalendarEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Date Events
      .addCase(getDateEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDateEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Hanya set dateEvents (tidak ada trades)
        state.dateEvents = action.payload.data?.events || action.payload.events || action.payload.data || action.payload || [];
      })
      .addCase(getDateEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Calendar Summary
      .addCase(getCalendarSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCalendarSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.summary = action.payload.data || action.payload;
      })
      .addCase(getCalendarSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Calendar Event
      .addCase(createCalendarEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCalendarEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Event created successfully';
        
        const newEvent = action.payload.data || action.payload;
        if (newEvent) {
          state.events.push(newEvent);
          state.dateEvents.push(newEvent);
        }
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Calendar Event
      .addCase(updateCalendarEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Event updated successfully';
        
        const updatedEvent = action.payload.data || action.payload;
        if (updatedEvent) {
          const index = state.events.findIndex(e => e.id === updatedEvent.id);
          if (index !== -1) {
            state.events[index] = updatedEvent;
          }
          
          const dateIndex = state.dateEvents.findIndex(e => e.id === updatedEvent.id);
          if (dateIndex !== -1) {
            state.dateEvents[dateIndex] = updatedEvent;
          }
        }
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Calendar Event
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCalendarEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Event deleted successfully';
        state.events = state.events.filter(e => e.id !== action.meta.arg);
        state.dateEvents = state.dateEvents.filter(e => e.id !== action.meta.arg);
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Toggle Event Completion
      .addCase(toggleEventCompletion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleEventCompletion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        const toggledEvent = action.payload.data || action.payload;
        if (toggledEvent) {
          const index = state.events.findIndex(e => e.id === toggledEvent.id);
          if (index !== -1) {
            state.events[index] = toggledEvent;
          }
          
          const dateIndex = state.dateEvents.findIndex(e => e.id === toggledEvent.id);
          if (dateIndex !== -1) {
            state.dateEvents[dateIndex] = toggledEvent;
          }
        }
      })
      .addCase(toggleEventCompletion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { 
  resetCalendar, 
  setSelectedDate, 
  setCurrentView, 
  updateEventInState,
  clearDateEvents 
} = calendarSlice.actions;

export default calendarSlice.reducer;