import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./ResetPassword.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validatePassword,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../../redux/slices/auth.slice";

/**
 * ResetPassword Component
 *
 * Provides the form for resetting a password.
 * Includes password validation and error handling.
 * Redirects to login page after successful reset.
 *
 * @component
 * @example
 * return (
 *   <ResetPassword />
 * )
 */
const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors = passwordError || !password;
  }, [passwordError, password]);

  /**
   * Handle password input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  /**
   * Handle form submission for password reset
   * Validates password and dispatches reset password action
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleResetPassword = async (event) => {
    event.preventDefault();

    const fields = { password };
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
      const resetPasswordData = {
        password,
        token,
      };
      const resultAction = await dispatch(resetPassword(resetPasswordData));

      if (resetPassword.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload.message || "Password reset successfully!";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/signin");
        }, 2000);

        setPassword("");
      } else if (resetPassword.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        const errorMessage =
          errorPayload?.message || "Password reset failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An error occurred during password reset:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reset-password">
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

                {/* Reset Password Form */}
                <form className="form-container" onSubmit={handleResetPassword}>
                  <div className="password-container">
                    <InputField
                      label="New Password"
                      type="password"
                      editable={true}
                      value={password}
                      onChange={handlePasswordChange}
                      icon={<i className="fas fa-lock"></i>}
                      error={passwordError}
                    />
                  </div>

                  <div className="btn-container">
                    <Button
                      title="Reset Password"
                      width={"100%"}
                      onPress={handleResetPassword}
                      loading={loading}
                      icon={<i className="fas fa-key"></i>}
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

export default ResetPassword;
