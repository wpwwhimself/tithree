<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { google, calendar_v3 } from 'googleapis';
import ElectronGoogleOAuth2 from "@getstation/electron-google-oauth2";

const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const events = ref<calendar_v3.Schema$Event[] | undefined>([]);
let oauth: any;

window.ipcRenderer.on('google-auth-token', async (event, token) => {
  oauth.setCredentials(token);

  // Fetch calendar events
  // try {
  //   const calendar = google.calendar({ version: 'v3', auth: oauth });
  //   const { data } = await calendar.events.list({
  //     calendarId: 'primary', // Use 'primary' for the user's primary calendar
  //     timeMin: new Date().toISOString(),
  //     maxResults: 10,
  //     singleEvents: true,
  //     orderBy: 'startTime',
  //   });

  //   events.value = data.items;
  // } catch (error) {
  //   console.error('Error fetching calendar events:', error);
  // }
});

onMounted(() => {
  // oauth = new google.auth.OAuth2(
  //   import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
  //   import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
  //   REDIRECT_URI
  // )
  // oauth = new ElectronGoogleOAuth2(
  //   import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
  //   import.meta.env.VITE_GOOGLE_API_CLIENT_SECRET,
  //   SCOPES
  // )
  // window.ipcRenderer.send("calendar-authenticate", oauth);
})
</script>

<template>
  <PageHeader title="Kalendarz sesji"></PageHeader>

</template>
