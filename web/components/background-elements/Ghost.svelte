<div class="background-element ghost">
  <svg
    viewBox="-20.71 0 173.8 173.8"
    xmlns="http://www.w3.org/2000/svg"
    fill="#a1854a"
    stroke="#a1854a"
    ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g><g id="SVGRepo_iconCarrier">
      <defs>
        <style>
          .cls-1 {
            fill: #ffffff;
          }
        </style>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <path
            d="M132.39,134.48a20.26,20.26,0,0,1-2.1,3.09,35.23,35.23,0,0,1-3.51,2.7c-1.43-.58-2.7-1.19-4-1.63-8.15-2.69-15.51-.21-20,7.2-2.19,3.63-3.62,7.72-5.62,12.08-3.37,3.28-7.31,2.6-11.25-.06-1.17-.8-2.12-1.93-3.27-2.78-7.75-5.7-16.18-3.43-20.35,5.46-2.88,6.12-6.76,6.67-10.46,1.08-2.65-4-5.26-8-10.55-7.44a17.54,17.54,0,0,0-13.42,8.28c-1.39,2.16-2.43,4.55-3.85,6.69a15.87,15.87,0,0,1-3.39,3.69c-1.89,1.48-4.11,1.28-5.16-.78a115,115,0,0,1-7-15.54c-3.38-10.16-2.14-20.44,1.13-30.39a48.6,48.6,0,0,0-.45-32Q5.79,84.41,2.93,74.51a68.21,68.21,0,0,1,2.4-46.23c5.2-12.54,15.07-20.56,28-24.81,14.94-4.91,29.89-4.35,44.77,0a42.88,42.88,0,0,1,15.66,8.72c7.65,6.54,14.47,13.9,17.72,23.79,1.7,5.15,3.49,10.29,4.9,15.51a15.36,15.36,0,0,1,.34,6.77c-2.76,13.6-1.92,27.31-1.3,41,.26,5.74,2.54,11.09,5.6,16.06C124.91,121.64,128.6,128.07,132.39,134.48ZM55.82,149.32c19.95-9.42,20.2-7.16,34.46-2.42a12.64,12.64,0,0,0,1.44-2c4-8.59,10.33-14.23,19.88-16,1.21-.23,2.26-1.36,3.54-2.17-1.31-2.4-2.25-4.49-3.52-6.36-4.65-6.89-6.43-14.66-6.75-22.74-.34-8.56-.59-17.17-.11-25.71.71-12.8-.5-25.13-6.33-36.72C92.2,22.84,83,14,69,11.09a61.32,61.32,0,0,0-25.59-.24c-13.9,3.05-23.23,11.56-28,25.08-3.73,10.54-3,21.39-2.7,32.24a5.65,5.65,0,0,0,.38,1.65,281.08,281.08,0,0,1,8.67,27.63c1.79,7.45,2.3,14.5.5,21.87-1.55,6.37-2.75,12.83-4.31,19.2a29.75,29.75,0,0,0-.2,12.77c.24,1.21,1.07,2.31,1.83,3.87C31.05,146.15,42.52,140.48,55.82,149.32Z"
          ></path>
          <path
            class="cls-1"
            d="M55.82,149.32c-13.3-8.84-24.77-3.17-36.21,5.84-.76-1.56-1.59-2.66-1.83-3.87a29.75,29.75,0,0,1,.2-12.77c1.56-6.37,2.76-12.83,4.31-19.2,1.8-7.37,1.29-14.42-.5-21.87a281.08,281.08,0,0,0-8.67-27.63,5.65,5.65,0,0,1-.38-1.65c-.28-10.85-1-21.7,2.7-32.24,4.77-13.52,14.1-22,28-25.08A61.32,61.32,0,0,1,69,11.09C83,14,92.2,22.84,98.43,35.2c5.83,11.59,7,23.92,6.33,36.72-.48,8.54-.23,17.15.11,25.71.32,8.08,2.1,15.85,6.75,22.74,1.27,1.87,2.21,4,3.52,6.36-1.28.81-2.33,1.94-3.54,2.17-9.55,1.76-15.87,7.4-19.88,16a12.64,12.64,0,0,1-1.44,2C76,142.16,75.77,139.9,55.82,149.32Z"
          ></path>
        </g>
      </g>
    </g></svg
  >
</div>

<style>
  .ghost {
    width: 100px;
    height: 100px;
    top: 80%;
    left: 20%;
  }

  .background-element {
    position: absolute;
    opacity: 0.4;
    z-index: -1;
    animation: ghostFloat 4s infinite;
  }

  @keyframes ghostFloat {
    0% {
      opacity: 0.4;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-40px);
    }
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
  }
</style>
