import PostHog from 'posthog-react-native'

const client = new PostHog('YOUR_POSTHOG_KEY', {
  host: 'https://eu.posthog.com',
})

type EventName =
  | 'app_opened'
  | 'feed_scrolled'
  | 'story_tapped'
  | 'listing_viewed'
  | 'listing_saved'
  | 'message_sent'
  | 'listing_posted'
  | 'post_started'
  | 'post_step_completed'
  | 'post_listing_type_chosen'
  | 'post_abandoned'
  | 'viewing_requested'
  | 'viewing_confirmed'
  | 'maintenance_raised'
  | 'user_blocked'
  | 'user_reported'
  | 'scam_warning_shown'
  | 'scam_warning_proceeded'
  | 'signup_completed'
  | 'signin_completed'
  | 'phone_verified'
  | 'email_verified'
  | 'saved_search_created'
  | 'landlord_verification_completed'

export function track(event: EventName, properties?: Record<string, string | number | boolean | null>): void {
  client.capture(event, properties)
}
