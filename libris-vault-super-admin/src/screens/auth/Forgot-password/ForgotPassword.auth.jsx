import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./ForgotPassword.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../../redux/slices/auth.slice";

/**
 * ForgotPassword Component
 *
 * Provides the form for requesting a password reset.
 * Includes email validation and error handling.
 * Redirects to confirmation page or shows success message.
 *
 * @component
 * @example
 * return (
 *   <ForgotPassword />
 * )
 */
const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const hasErrors = emailError || !email;
  }, [emailError, email]);

  /**
   * Handle email input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  /**
   * Handle form submission for password reset request
   * Validates email and dispatches forgot password action
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    const fields = { email };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      toast.error(errors[firstErrorKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const forgotPasswordData = { email };
      const resultAction = await dispatch(forgotPassword(forgotPasswordData));

      if (forgotPassword.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload.message ||
          "Password reset instructions sent to your email";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/");
        }, 2000);

        setEmail("");
      } else if (forgotPassword.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        const errorMessage =
          errorPayload?.message || "Request failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An error occurred during password reset request:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="forgot-password">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                {/* Logo */}
                <div className="logo-container">
                  <img src={Logo} alt="Logo" className="logo" />
                  <span className="logo-text">LibrisVault</span>
                </div>

                {/* Forgot Password Form */}
                <form
                  className="form-container"
                  onSubmit={handleForgotPassword}
                >
                  <div className="email-container">
                    <InputField
                      label="Enter Email"
                      type="email"
                      editable={true}
                      value={email}
                      onChange={handleEmailChange}
                      icon={<i className="fas fa-envelope"></i>}
                    />
                  </div>

                  <div className="btn-container">
                    <Button
                      title="Send Reset Email"
                      width={"100%"}
                      onPress={handleForgotPassword}
                      loading={loading}
                      icon={<i className="fas fa-sign-in-alt"></i>}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
