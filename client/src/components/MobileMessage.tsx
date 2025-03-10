export default function MobileMessage() {
  return (
    <div className="mobile-message fixed inset-0 flex items-center justify-center bg-gray-900 z-50 p-4">
      <div className="pixel-border bg-gray-800 p-6 max-w-md text-center">
        <h2 className="font-pixel text-xl mb-4 text-sand-yellow">Desktop Only</h2>
        <p className="text-lg mb-6 text-white font-pixel-body">Sloop King is currently only available on desktop browsers. Please switch to a larger screen to play!</p>
        <div className="w-24 h-24 mx-auto mb-4 pixel-art">
          <div className="w-full h-full bg-ocean-blue relative">
            <div className="absolute w-16 h-8 bg-wood-brown bottom-4 left-4"></div>
            <div className="absolute w-8 h-16 bg-white bottom-8 left-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
