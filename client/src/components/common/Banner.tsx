import React from 'react';
import { FaTruck, FaShieldAlt } from 'react-icons/fa';
import { RiServiceFill } from "react-icons/ri";

// Define the Banner component
const Banner: React.FC = () => {
    return (
        // Container for the banner section
        <section className="container bg-blue-100 py-8 rounded-md">
            <div className="container mx-auto flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0">
                {/* Free Delivery Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="text-yellow-500">
                        <FaTruck size={40} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Free delivery</h3>
                        <p>on order above $50.00</p>
                    </div>
                </div>

                {/* Best Quality Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="text-yellow-500">
                        <RiServiceFill size={40} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Fresh & organic</h3>
                        <p>Farm-fresh produce at the best price</p>
                    </div>
                </div>

                {/* Warranty Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="text-yellow-500">
                        <FaShieldAlt size={40} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Daily deals</h3>
                        <p>Save more with special <br/> offers every day</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
