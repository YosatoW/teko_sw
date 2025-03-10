<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow bg-[#2C2C2C]"> <!-- Body seiten 363636 -->
      <div class="max-w-6xl mx-auto p-4 w-full">
        <slot />
      </div>
    </main>
    <Footer />
  </div>
</template>
