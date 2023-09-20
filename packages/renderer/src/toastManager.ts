import { ToastData } from "types"
import { ref } from "vue"

export const toast = ref({} as ToastData)
const countdown = ref(2)
const counting = ref(false)

export const setToast = (
  title: string,
  error = false,
  icon?: string,
  subtitle?: string
) => {
  // set toast
  toast.value = {
    visible: true,
    title: title,
    subtitle: subtitle,
    icon: icon,
    error: error,
  };

  // auto-hide
  counting.value = true;
  countdown.value = 2;

  const timeout = setInterval(() => {
    countdown.value -= 0.5;

    if(countdown.value <= 0){
      clearInterval(timeout);
      clearToast();
      counting.value = false;
    }
  }, 1e3);
}

export const setErrorToast = (title: string, desc: any) => {
  setToast(title, true, "xmark", desc)
}

export const clearToast = () => {
  toast.value = { ...toast.value, visible: false};
}
